
import uuid
import re

from io import BytesIO
from datetime import datetime

from bson import ObjectId
from pypdf import PdfReader

from app.config.database import db
from app.config.supabase_client import supabase


# ============================================================
# Configuration
# ============================================================

BUCKET_NAME = "documents"

# MongoDB collection
documents_collection = db["documents"]


# ============================================================
# Document Service
# ============================================================

class DocumentService:

    # ========================================================
    # Upload document
    # ========================================================

    @staticmethod
    async def upload_document(
        file_bytes,
        file_name,
        content_type,
        user_id,
        document_type="other"
    ):

        supabase_uploaded = False
        supabase_record_id = None
        storage_path = None

        try:

            # ------------------------------------------------
            # Validate user ID
            # ------------------------------------------------

            if not user_id:
                raise ValueError("user_id is required")

            user_id = str(user_id).strip()

            if not user_id:
                raise ValueError("user_id cannot be empty")

            # ------------------------------------------------
            # Validate document type
            # ------------------------------------------------

            allowed_document_types = {
                "patent",
                "research_paper",
                "other"
            }

            document_type = str(document_type).strip().lower()

            if document_type not in allowed_document_types:
                raise ValueError(
                    "document_type must be one of: "
                    "patent, research_paper, other"
                )

            # ------------------------------------------------
            # Validate file type
            # ------------------------------------------------

            if content_type != "application/pdf":
                raise ValueError("Only PDF files are supported")

            if not file_bytes:
                raise ValueError("Uploaded file is empty")

            # ------------------------------------------------
            # Validate filename
            # ------------------------------------------------

            if not file_name:
                raise ValueError("File name is required")

            safe_file_name = (
                str(file_name)
                .replace("\\", "_")
                .replace("/", "_")
                .strip()
            )

            if not safe_file_name:
                raise ValueError("Invalid file name")

            # ------------------------------------------------
            # Generate document UUID
            # ------------------------------------------------

            document_uuid = str(uuid.uuid4())

            # ------------------------------------------------
            # Supabase Storage path
            # ------------------------------------------------

            storage_path = (
                f"{user_id}/"
                f"{document_uuid}/"
                f"{safe_file_name}"
            )

            # ------------------------------------------------
            # Upload PDF to Supabase Storage
            # ------------------------------------------------

            supabase.storage.from_(BUCKET_NAME).upload(
                storage_path,
                file_bytes,
                {
                    "content-type": content_type,
                    "upsert": False
                }
            )

            supabase_uploaded = True

            # ------------------------------------------------
            # Get public URL
            # ------------------------------------------------

            file_url = (
                supabase
                .storage
                .from_(BUCKET_NAME)
                .get_public_url(storage_path)
            )

            # ------------------------------------------------
            # Save file reference in Supabase table
            # ------------------------------------------------

            supabase_record = {
                "user_id": user_id,
                "file_url": file_url,
                "storage_path": storage_path,
                "original_filename": safe_file_name,
                "file_type": content_type,
                "file_size": len(file_bytes)
            }

            supabase_result = (
                supabase
                .table("documents")
                .insert(supabase_record)
                .execute()
            )

            if not supabase_result.data:
                raise ValueError(
                    "Failed to save document reference in Supabase"
                )

            supabase_document = supabase_result.data[0]

            supabase_record_id = supabase_document.get("id")

            # ------------------------------------------------
            # Extract PDF text
            # ------------------------------------------------

            text = DocumentService.extract_text(file_bytes)

            if not text or not text.strip():
                raise ValueError(
                    "Could not extract text from PDF. "
                    "The PDF may be scanned or image-only."
                )

            # ------------------------------------------------
            # Extract document information
            # ------------------------------------------------

            title = DocumentService.extract_title(text)
            authors = DocumentService.extract_authors(text)
            abstract = DocumentService.extract_abstract(text)
            year = DocumentService.extract_year(text)
            doi = DocumentService.extract_doi(text)
            journal = DocumentService.extract_journal(text)
            keywords = DocumentService.extract_keywords(text)

            research_domain = (
                DocumentService.detect_research_domain(text)
            )

            technology_areas = (
                DocumentService.detect_technology_areas(text)
            )

            patent_information = (
                DocumentService.extract_patent_information(text)
            )

            funding_information = (
                DocumentService.extract_funding_information(text)
            )

            # ------------------------------------------------
            # Create MongoDB document
            # ------------------------------------------------

            now = datetime.utcnow()

            document = {
                "user_id": user_id,
                "document_type": document_type,

                "title": title,
                "authors": authors,
                "abstract": abstract,
                "year": year,
                "doi": doi,
                "journal": journal,
                "keywords": keywords,

                "research_domain": research_domain,
                "technology_areas": technology_areas,

                "patent_information": patent_information,
                "funding_information": funding_information,

                "file_information": {
                    "original_filename": safe_file_name,
                    "file_type": content_type,
                    "file_size": len(file_bytes),
                    "bucket_name": BUCKET_NAME,
                    "storage_path": storage_path,
                    "file_url": file_url,
                    "supabase_document_id": supabase_record_id
                },

                "created_at": now,
                "updated_at": now
            }

            # ------------------------------------------------
            # Save to MongoDB
            # ------------------------------------------------

            result = documents_collection.insert_one(document)

            document["_id"] = result.inserted_id

            # ------------------------------------------------
            # Return JSON-friendly document
            # ------------------------------------------------

            return DocumentService.serialize_document(document)

        except Exception as e:

            # ------------------------------------------------
            # Cleanup Supabase Storage
            # ------------------------------------------------

            if supabase_uploaded and storage_path:
                try:
                    (
                        supabase
                        .storage
                        .from_(BUCKET_NAME)
                        .remove([storage_path])
                    )
                except Exception as cleanup_error:
                    print(
                        "[SUPABASE CLEANUP ERROR] "
                        f"{str(cleanup_error)}"
                    )

            # ------------------------------------------------
            # Cleanup Supabase table
            # ------------------------------------------------

            if supabase_record_id:
                try:
                    (
                        supabase
                        .table("documents")
                        .delete()
                        .eq("id", supabase_record_id)
                        .execute()
                    )
                except Exception as cleanup_error:
                    print(
                        "[SUPABASE TABLE CLEANUP ERROR] "
                        f"{str(cleanup_error)}"
                    )

            print(f"[DOCUMENT ERROR] {str(e)}")

            raise e

    # ========================================================
    # Get documents
    #
    # Supports:
    #   /api/documents
    #   /api/documents?user_id=USER_006
    #   /api/documents?document_type=research_paper
    #   /api/documents?user_id=USER_006&document_type=research_paper
    # ========================================================

    @staticmethod
    async def get_documents(
        user_id: str | None = None,
        document_type: str | None = None
    ):

        query = {}

        # ----------------------------------------------------
        # Filter by user
        # ----------------------------------------------------

        if user_id:
            query["user_id"] = str(user_id).strip()

        # ----------------------------------------------------
        # Filter by document type
        # ----------------------------------------------------

        if document_type:
            document_type = str(document_type).strip().lower()

            allowed_document_types = {
                "patent",
                "research_paper",
                "other"
            }

            if document_type not in allowed_document_types:
                raise ValueError(
                    "document_type must be one of: "
                    "patent, research_paper, other"
                )

            query["document_type"] = document_type

        # ----------------------------------------------------
        # IMPORTANT:
        # MongoDB is using PyMongo (synchronous).
        #
        # DO NOT use await here.
        # ----------------------------------------------------

        documents = list(
            documents_collection
            .find(query)
            .sort("created_at", -1)
        )

        # ----------------------------------------------------
        # Serialize documents
        # ----------------------------------------------------

        return [
            DocumentService.serialize_document(document)
            for document in documents
        ]

    # ========================================================
    # Get single document
    # ========================================================

    @staticmethod
    async def get_document(document_id):

        try:
            object_id = ObjectId(document_id)
        except Exception:
            return None

        document = documents_collection.find_one(
            {
                "_id": object_id
            }
        )

        if not document:
            return None

        return DocumentService.serialize_document(document)

    # ========================================================
    # Update document
    # ========================================================

    @staticmethod
    async def update_document(
        document_id,
        file_bytes,
        file_name,
        content_type
    ):

        try:
            object_id = ObjectId(document_id)
        except Exception:
            return None

        # ----------------------------------------------------
        # Find existing document
        # ----------------------------------------------------

        existing = documents_collection.find_one(
            {
                "_id": object_id
            }
        )

        if not existing:
            return None

        # ----------------------------------------------------
        # Validate file
        # ----------------------------------------------------

        if content_type != "application/pdf":
            raise ValueError("Only PDF files are supported")

        if not file_bytes:
            raise ValueError("Uploaded file is empty")

        # ----------------------------------------------------
        # Extract text
        # ----------------------------------------------------

        text = DocumentService.extract_text(file_bytes)

        if not text or not text.strip():
            raise ValueError(
                "Could not extract text from PDF."
            )

        # ----------------------------------------------------
        # Extract information
        # ----------------------------------------------------

        title = DocumentService.extract_title(text)
        authors = DocumentService.extract_authors(text)
        abstract = DocumentService.extract_abstract(text)
        year = DocumentService.extract_year(text)
        doi = DocumentService.extract_doi(text)
        journal = DocumentService.extract_journal(text)
        keywords = DocumentService.extract_keywords(text)

        research_domain = (
            DocumentService.detect_research_domain(text)
        )

        technology_areas = (
            DocumentService.detect_technology_areas(text)
        )

        patent_information = (
            DocumentService.extract_patent_information(text)
        )

        funding_information = (
            DocumentService.extract_funding_information(text)
        )

        # ----------------------------------------------------
        # Update MongoDB
        # ----------------------------------------------------

        update_data = {
            "title": title,
            "authors": authors,
            "abstract": abstract,
            "year": year,
            "doi": doi,
            "journal": journal,
            "keywords": keywords,
            "research_domain": research_domain,
            "technology_areas": technology_areas,
            "patent_information": patent_information,
            "funding_information": funding_information,

            "file_information": {
                "original_filename": file_name,
                "file_type": content_type,
                "file_size": len(file_bytes)
            },

            "updated_at": datetime.utcnow()
        }

        documents_collection.update_one(
            {
                "_id": object_id
            },
            {
                "$set": update_data
            }
        )

        # ----------------------------------------------------
        # Get updated document
        # ----------------------------------------------------

        updated = documents_collection.find_one(
            {
                "_id": object_id
            }
        )

        if not updated:
            return None

        return DocumentService.serialize_document(updated)

    # ========================================================
    # Delete document
    # ========================================================

    @staticmethod
    async def delete_document(document_id):

        try:
            object_id = ObjectId(document_id)
        except Exception:
            return False

        # ----------------------------------------------------
        # Find document
        # ----------------------------------------------------

        existing = documents_collection.find_one(
            {
                "_id": object_id
            }
        )

        if not existing:
            return False

        # ----------------------------------------------------
        # Get file information
        # ----------------------------------------------------

        file_information = existing.get(
            "file_information",
            {}
        )

        storage_path = file_information.get(
            "storage_path"
        )

        # ----------------------------------------------------
        # Delete Supabase Storage file
        # ----------------------------------------------------

        if storage_path:

            try:
                (
                    supabase
                    .storage
                    .from_(BUCKET_NAME)
                    .remove([storage_path])
                )

            except Exception as e:

                print(
                    "[SUPABASE DELETE ERROR] "
                    f"{str(e)}"
                )

        # ----------------------------------------------------
        # Delete Supabase table record
        # ----------------------------------------------------

        supabase_document_id = (
            file_information.get(
                "supabase_document_id"
            )
        )

        if supabase_document_id:

            try:
                (
                    supabase
                    .table("documents")
                    .delete()
                    .eq(
                        "id",
                        supabase_document_id
                    )
                    .execute()
                )

            except Exception as e:

                print(
                    "[SUPABASE TABLE DELETE ERROR] "
                    f"{str(e)}"
                )

        # ----------------------------------------------------
        # Delete MongoDB document
        # ----------------------------------------------------

        result = documents_collection.delete_one(
            {
                "_id": object_id
            }
        )

        return result.deleted_count > 0

    # ========================================================
    # Serialize MongoDB document
    # ========================================================

    @staticmethod
    def serialize_document(document):

        if not document:
            return None

        document = dict(document)

        if "_id" in document:
            document["id"] = str(document["_id"])
            del document["_id"]

        return document

    # ========================================================
    # Extract text from PDF
    # ========================================================

    @staticmethod
    def extract_text(file_bytes):

        reader = PdfReader(
            BytesIO(file_bytes)
        )

        pages = []

        for page in reader.pages:

            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n".join(pages)

    # ========================================================
    # Clean text
    # ========================================================

    @staticmethod
    def clean_text(text):

        if not text:
            return ""

        text = re.sub(
            r"\s+",
            " ",
            text
        )

        return text.strip()

    # ========================================================
    # Extract title
    # ========================================================

    @staticmethod
    def extract_title(text):

        if not text:
            return None

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        if not lines:
            return None

        for line in lines[:10]:

            lower_line = line.lower()

            if (
                10 <= len(line) <= 250
                and "abstract" not in lower_line
                and "keywords" not in lower_line
                and "introduction" not in lower_line
            ):
                return line

        return lines[0]

    # ========================================================
    # Extract abstract
    # ========================================================

    @staticmethod
    def extract_abstract(text):

        if not text:
            return None

        pattern = re.search(
            r"\babstract\b\s*:?\s*(.*?)(?=\bkeywords?\b|\bintroduction\b)",
            text,
            re.IGNORECASE | re.DOTALL
        )

        if pattern:

            abstract = pattern.group(1).strip()

            abstract = DocumentService.clean_text(
                abstract
            )

            return abstract[:5000]

        return None

    # ========================================================
    # Extract DOI
    # ========================================================

    @staticmethod
    def extract_doi(text):

        if not text:
            return None

        pattern = (
            r"\b10\.\d{4,9}/"
            r"[-._;()/:\w]+\b"
        )

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            doi = match.group(0)

            return doi.rstrip(
                ".,;)"
            )

        return None

    # ========================================================
    # Extract year
    # ========================================================

    @staticmethod
    def extract_year(text):

        if not text:
            return None

        years = re.findall(
            r"\b(20\d{2})\b",
            text
        )

        current_year = datetime.now().year

        for year in years:

            year_int = int(year)

            if (
                2000 <= year_int <= current_year
            ):
                return year_int

        return None

    # ========================================================
    # Extract keywords
    # ========================================================

    @staticmethod
    def extract_keywords(text):

        if not text:
            return []

        pattern = re.search(
            r"\bkeywords?\b\s*:?\s*(.*?)(?=\bintroduction\b)",
            text,
            re.IGNORECASE | re.DOTALL
        )

        if not pattern:
            return []

        keyword_text = pattern.group(1)

        keyword_text = keyword_text.replace(
            "\n",
            " "
        )

        keywords = re.split(
            r"[,;|]",
            keyword_text
        )

        result = []

        for keyword in keywords:

            keyword = keyword.strip()

            if (
                keyword
                and len(keyword) <= 100
            ):
                result.append(keyword)

        return result[:20]

    # ========================================================
    # Extract authors
    # ========================================================

    @staticmethod
    def extract_authors(text):

        if not text:
            return []

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        for line in lines[1:10]:

            lower_line = line.lower()

            if (
                "abstract" in lower_line
                or "keywords" in lower_line
                or "journal" in lower_line
                or "university" in lower_line
            ):
                continue

            if re.search(
                r"[A-Z][a-z]+",
                line
            ):

                authors = re.split(
                    r",|\band\b|&",
                    line,
                    flags=re.IGNORECASE
                )

                authors = [
                    author.strip()
                    for author in authors
                    if author.strip()
                ]

                if 1 <= len(authors) <= 10:

                    valid_authors = []

                    for author in authors:

                        if (
                            2 <= len(author) <= 100
                            and not re.search(
                                r"\d",
                                author
                            )
                        ):
                            valid_authors.append(author)

                    if valid_authors:
                        return valid_authors

        return []

    # ========================================================
    # Extract journal
    # ========================================================

    @staticmethod
    def extract_journal(text):

        if not text:
            return None

        patterns = [
            r"\bjournal\b\s*:?\s*(.*?)(?=\byear\b|\babstract\b)",
            r"\bpublished\s+in\b\s*:?\s*(.*?)(?=\byear\b|\babstract\b)"
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE | re.DOTALL
            )

            if match:

                journal = DocumentService.clean_text(
                    match.group(1)
                )

                if journal:
                    return journal[:300]

        return None

    # ========================================================
    # Detect research domain
    # ========================================================

    @staticmethod
    def detect_research_domain(text):

        if not text:
            return None

        text_lower = text.lower()

        domains = {

            "Artificial Intelligence": [
                "artificial intelligence",
                "machine learning",
                "deep learning",
                "neural network"
            ],

            "Computer Science": [
                "computer science",
                "software",
                "algorithm",
                "computing"
            ],

            "Agriculture": [
                "agriculture",
                "crop",
                "farming",
                "plant disease"
            ],

            "Healthcare": [
                "healthcare",
                "medical",
                "medicine",
                "clinical",
                "hospital"
            ],

            "Biotechnology": [
                "biotechnology",
                "genetics",
                "genome",
                "biological"
            ],

            "Renewable Energy": [
                "renewable energy",
                "solar energy",
                "wind energy",
                "photovoltaic"
            ],

            "Robotics": [
                "robot",
                "robotics",
                "autonomous robot"
            ]
        }

        scores = {}

        for domain, keywords in domains.items():

            score = 0

            for keyword in keywords:
                score += text_lower.count(keyword)

            scores[domain] = score

        if not scores:
            return None

        best_domain = max(
            scores,
            key=scores.get
        )

        if scores[best_domain] == 0:
            return None

        return best_domain

    # ========================================================
    # Detect technology areas
    # ========================================================

    @staticmethod
    def detect_technology_areas(text):

        if not text:
            return []

        text_lower = text.lower()

        technologies = {

            "Machine Learning": [
                "machine learning"
            ],

            "Deep Learning": [
                "deep learning"
            ],

            "Computer Vision": [
                "computer vision",
                "image processing"
            ],

            "Natural Language Processing": [
                "natural language processing",
                "nlp"
            ],

            "Artificial Intelligence": [
                "artificial intelligence"
            ],

            "Neural Networks": [
                "neural network",
                "neural networks"
            ],

            "Internet of Things": [
                "internet of things",
                "iot"
            ],

            "Robotics": [
                "robotics",
                "robot"
            ],

            "Blockchain": [
                "blockchain"
            ],

            "Cloud Computing": [
                "cloud computing"
            ]
        }

        detected = []

        for technology, keywords in technologies.items():

            for keyword in keywords:

                if keyword in text_lower:

                    detected.append(
                        technology
                    )

                    break

        return detected

    # ========================================================
    # Extract patent information
    # ========================================================

    @staticmethod
    def extract_patent_information(text):

        if not text:

            return {
                "has_patent": False,
                "patent_count": 0
            }

        text_lower = text.lower()

        negative_patterns = [

            r"\bno patent\b",
            r"\bno patents\b",
            r"\bno patent has been filed\b",
            r"\bno patents have been filed\b",
            r"\bpatent has not been filed\b",
            r"\bpatents have not been filed\b",
            r"\bpatent was not filed\b",
            r"\bpatents were not filed\b",
            r"\bwithout a patent\b",
            r"\bwithout patents\b"
        ]

        for pattern in negative_patterns:

            if re.search(
                pattern,
                text_lower
            ):

                return {
                    "has_patent": False,
                    "patent_count": 0
                }

        patent_count = len(
            re.findall(
                r"\bpatents?\b",
                text_lower
            )
        )

        return {
            "has_patent": patent_count > 0,
            "patent_count": patent_count
        }

    # ========================================================
    # Extract funding information
    # ========================================================

    @staticmethod
    def extract_funding_information(text):

        if not text:

            return {
                "has_funding": False,
                "funding_count": 0,
                "total_funding_received": 0,
                "currency": "INR"
            }

        text_lower = text.lower()

        funding_keywords = [

            "funding",
            "funded",
            "grant",
            "research grant",
            "financial support",
            "financially supported",
            "sponsored",
            "sponsorship"
        ]

        funding_count = 0

        for keyword in funding_keywords:

            funding_count += text_lower.count(
                keyword
            )

        has_funding = funding_count > 0

        # ----------------------------------------------------
        # Funding amount
        # ----------------------------------------------------

        total_funding = 0
        currency = "INR"

        # ----------------------------------------------------
        # INR
        # ----------------------------------------------------

        inr_matches = re.findall(
            r"(?:inr|rs\.?|₹)\s*"
            r"([0-9,]+(?:\.[0-9]+)?)",
            text_lower
        )

        if inr_matches:

            for amount in inr_matches:

                amount = amount.replace(
                    ",",
                    ""
                )

                try:
                    total_funding += float(amount)

                except ValueError:
                    pass

        # ----------------------------------------------------
        # USD
        # ----------------------------------------------------

        usd_matches = re.findall(
            r"(?:usd|\$)\s*"
            r"([0-9,]+(?:\.[0-9]+)?)",
            text_lower
        )

        if usd_matches:

            currency = "USD"

            if total_funding == 0:

                for amount in usd_matches:

                    amount = amount.replace(
                        ",",
                        ""
                    )

                    try:
                        total_funding += float(amount)

                    except ValueError:
                        pass

        return {
            "has_funding": has_funding,
            "funding_count": funding_count,
            "total_funding_received": total_funding,
            "currency": currency
        }

