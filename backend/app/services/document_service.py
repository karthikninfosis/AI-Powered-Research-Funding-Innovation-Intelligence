import re
from io import BytesIO
from datetime import datetime

from bson import ObjectId
from pypdf import PdfReader

from app.config.database import db


# MongoDB collection
documents_collection = db["documents"]


class DocumentService:

    # =========================================================
    # Convert MongoDB ObjectId to JSON-friendly ID
    # =========================================================
    @staticmethod
    def serialize_document(document):

        if not document:
            return None

        document["id"] = str(document["_id"])
        del document["_id"]

        return document

    # =========================================================
    # Extract text from PDF
    # =========================================================
    @staticmethod
    def extract_text(file_bytes):

        reader = PdfReader(BytesIO(file_bytes))

        pages = []

        for page in reader.pages:

            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n".join(pages)

    # =========================================================
    # Clean text
    # =========================================================
    @staticmethod
    def clean_text(text):

        if not text:
            return ""

        text = re.sub(r"\s+", " ", text)

        return text.strip()

    # =========================================================
    # Extract title
    # =========================================================
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

        # First meaningful line is usually the title
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

    # =========================================================
    # Extract abstract
    # =========================================================
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

    # =========================================================
    # Extract DOI
    # =========================================================
    @staticmethod
    def extract_doi(text):

        if not text:
            return None

        pattern = (
            r"\b10\.\d{4,9}/"
            r"[-._;()/:A-Z0-9]+\b"
        )

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            doi = match.group(0)

            return doi.rstrip(".,;)")

        return None

    # =========================================================
    # Extract year
    # =========================================================
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

            if 2000 <= year_int <= current_year:

                return year_int

        return None

    # =========================================================
    # Extract keywords
    # =========================================================
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

            if keyword and len(keyword) <= 100:

                result.append(keyword)

        return result[:20]

    # =========================================================
    # Extract authors
    # =========================================================
    @staticmethod
    def extract_authors(text):

        if not text:
            return []

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        # Look at lines near the title
        for line in lines[1:10]:

            lower_line = line.lower()

            if (
                "abstract" in lower_line
                or "keywords" in lower_line
                or "journal" in lower_line
                or "university" in lower_line
            ):
                continue

            # Names generally contain letters and spaces
            if re.search(
                r"[A-Z][a-z]+",
                line
            ):

                # Split authors by comma / and / &
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

                # Avoid returning very long non-author lines
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

    # =========================================================
    # Extract journal
    # =========================================================
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

    # =========================================================
    # Detect research domain
    # =========================================================
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

    # =========================================================
    # Detect technology areas
    # =========================================================
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

                    detected.append(technology)

                    break

        return detected

    # =========================================================
    # Extract patent information
    # =========================================================
    @staticmethod
    def extract_patent_information(text):

        if not text:

            return {
                "has_patent": False,
                "patent_count": 0
            }

        text_lower = text.lower()

        # Check negative statements first
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

    # =========================================================
    # Extract funding information
    # =========================================================
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

        total_funding = 0

        currency = "INR"

        # INR
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

                    total_funding += float(
                        amount
                    )

                except ValueError:
                    pass

        # USD
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

                        total_funding += float(
                            amount
                        )

                    except ValueError:
                        pass

        return {

            "has_funding": has_funding,

            "funding_count": funding_count,

            "total_funding_received":
                total_funding,

            "currency": currency
        }

    # =========================================================
    # Upload + extract + save
    # =========================================================
    @staticmethod
    async def upload_document(

        file_bytes,

        file_name,

        content_type,

        entity_type,

        entity_id=None,

        user_id=None,

        profile_id=None

    ):

        try:

            # -------------------------------------------------
            # Validate file type
            # -------------------------------------------------
            if content_type != "application/pdf":

                raise ValueError(
                    "Only PDF files are supported"
                )

            # -------------------------------------------------
            # Validate file size
            # -------------------------------------------------
            if not file_bytes:

                raise ValueError(
                    "Uploaded file is empty"
                )

            # -------------------------------------------------
            # Extract PDF text
            # -------------------------------------------------
            text = DocumentService.extract_text(
                file_bytes
            )

            if not text.strip():

                raise ValueError(

                    "Could not extract text from PDF. "
                    "The PDF may be scanned or image-only."
                )

            # -------------------------------------------------
            # Extract research information
            # -------------------------------------------------
            title = DocumentService.extract_title(
                text
            )

            authors = DocumentService.extract_authors(
                text
            )

            abstract = DocumentService.extract_abstract(
                text
            )

            year = DocumentService.extract_year(
                text
            )

            doi = DocumentService.extract_doi(
                text
            )

            journal = DocumentService.extract_journal(
                text
            )

            keywords = DocumentService.extract_keywords(
                text
            )

            research_domain = (
                DocumentService.detect_research_domain(
                    text
                )
            )

            technology_areas = (
                DocumentService.detect_technology_areas(
                    text
                )
            )

            patent_information = (
                DocumentService.extract_patent_information(
                    text
                )
            )

            funding_information = (
                DocumentService.extract_funding_information(
                    text
                )
            )

            # -------------------------------------------------
            # Create MongoDB document
            # -------------------------------------------------
            now = datetime.utcnow()

            document = {

                "user_id": user_id,

                "profile_id": profile_id,

                "entity_type": entity_type,

                "entity_id": entity_id,

                "title": title,

                "authors": authors,

                "abstract": abstract,

                "year": year,

                "doi": doi,

                "journal": journal,

                "keywords": keywords,

                "research_domain":
                    research_domain,

                "technology_areas":
                    technology_areas,

                "patent_information":
                    patent_information,

                "funding_information":
                    funding_information,

                "file_information": {

                    "original_filename":
                        file_name,

                    "file_type":
                        content_type,

                    "file_size":
                        len(file_bytes)
                },

                "created_at": now,

                "updated_at": now
            }

            # -------------------------------------------------
            # Save to MongoDB
            # -------------------------------------------------
            result = (
                documents_collection.insert_one(
                    document
                )
            )

            document["_id"] = result.inserted_id

            return (
                DocumentService.serialize_document(
                    document
                )
            )

        except Exception as e:

            print(
                f"[DOCUMENT ERROR] {str(e)}"
            )

            raise e

    # =========================================================
    # Get all documents
    # =========================================================
    @staticmethod
    async def get_documents(

        entity_type=None,

        entity_id=None

    ):

        query = {}

        if entity_type:

            query["entity_type"] = entity_type

        if entity_id:

            query["entity_id"] = entity_id

        documents = list(
            documents_collection.find(
                query
            )
        )

        return [

            DocumentService.serialize_document(
                document
            )

            for document in documents

        ]

    # =========================================================
    # Get document by ID
    # =========================================================
    @staticmethod
    async def get_document(
        document_id
    ):

        try:

            object_id = ObjectId(
                document_id
            )

        except Exception:

            return None

        document = (
            documents_collection.find_one(
                {
                    "_id": object_id
                }
            )
        )

        return (
            DocumentService.serialize_document(
                document
            )
        )

    # =========================================================
    # Update document
    # =========================================================
    @staticmethod
    async def update_document(

        document_id,

        file_bytes,

        file_name,

        content_type

    ):

        try:

            object_id = ObjectId(
                document_id
            )

        except Exception:

            return None

        existing = (
            documents_collection.find_one(
                {
                    "_id": object_id
                }
            )
        )

        if not existing:

            return None

        if content_type != "application/pdf":

            raise ValueError(
                "Only PDF files are supported"
            )

        text = DocumentService.extract_text(
            file_bytes
        )

        if not text.strip():

            raise ValueError(
                "Could not extract text from PDF."
            )

        update_data = {

            "title":
                DocumentService.extract_title(
                    text
                ),

            "authors":
                DocumentService.extract_authors(
                    text
                ),

            "abstract":
                DocumentService.extract_abstract(
                    text
                ),

            "year":
                DocumentService.extract_year(
                    text
                ),

            "doi":
                DocumentService.extract_doi(
                    text
                ),

            "journal":
                DocumentService.extract_journal(
                    text
                ),

            "keywords":
                DocumentService.extract_keywords(
                    text
                ),

            "research_domain":
                DocumentService.detect_research_domain(
                    text
                ),

            "technology_areas":
                DocumentService.detect_technology_areas(
                    text
                ),

            "patent_information":
                DocumentService.extract_patent_information(
                    text
                ),

            "funding_information":
                DocumentService.extract_funding_information(
                    text
                ),

            "file_information": {

                "original_filename":
                    file_name,

                "file_type":
                    content_type,

                "file_size":
                    len(file_bytes)
            },

            "updated_at":
                datetime.utcnow()
        }

        documents_collection.update_one(

            {
                "_id": object_id
            },

            {
                "$set": update_data
            }
        )

        updated = (
            documents_collection.find_one(
                {
                    "_id": object_id
                }
            )
        )

        return (
            DocumentService.serialize_document(
                updated
            )
        )

    # =========================================================
    # Delete document
    # =========================================================
    @staticmethod
    async def delete_document(
        document_id
    ):

        try:

            object_id = ObjectId(
                document_id
            )

        except Exception:

            return False

        result = (
            documents_collection.delete_one(
                {
                    "_id": object_id
                }
            )
        )

        return result.deleted_count > 0
