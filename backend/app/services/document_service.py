import uuid
from app.config.supabase_client import supabase

BUCKET_NAME = "documents"


class DocumentService:

    @staticmethod
    async def upload_document(file_bytes, file_name, content_type, entity_type, entity_id=None):

        unique_name = f"{uuid.uuid4()}_{file_name}"

        supabase.storage.from_(BUCKET_NAME).upload(
            unique_name,
            file_bytes,
            {"content-type": content_type}
        )

        file_url = supabase.storage.from_(BUCKET_NAME).get_public_url(unique_name)

        result = supabase.table("documents").insert({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "file_name": unique_name,
            "file_url": file_url
        }).execute()

        return result.data[0]


    @staticmethod
    async def get_documents(entity_type=None, entity_id=None):

        query = supabase.table("documents").select("*")

        if entity_type:
            query = query.eq("entity_type", entity_type)

        if entity_id:
            query = query.eq("entity_id", entity_id)

        result = query.execute()

        return result.data


    @staticmethod
    async def get_document(document_id):

        result = supabase.table("documents").select("*").eq("id", document_id).execute()

        if not result.data:
            return None

        return result.data[0]


    @staticmethod
    async def update_document(document_id, file_bytes, file_name, content_type):

        existing = await DocumentService.get_document(document_id)

        if not existing:
            return None

        supabase.storage.from_(BUCKET_NAME).remove([existing["file_name"]])

        unique_name = f"{uuid.uuid4()}_{file_name}"

        supabase.storage.from_(BUCKET_NAME).upload(
            unique_name,
            file_bytes,
            {"content-type": content_type}
        )

        file_url = supabase.storage.from_(BUCKET_NAME).get_public_url(unique_name)

        result = supabase.table("documents").update({
            "file_name": unique_name,
            "file_url": file_url,
            "updated_at": "now()"
        }).eq("id", document_id).execute()

        return result.data[0]


    @staticmethod
    async def delete_document(document_id):

        existing = await DocumentService.get_document(document_id)

        if not existing:
            return False

        supabase.storage.from_(BUCKET_NAME).remove([existing["file_name"]])

        supabase.table("documents").delete().eq("id", document_id).execute()

        return True