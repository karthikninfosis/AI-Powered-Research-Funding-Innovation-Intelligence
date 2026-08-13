from bson import ObjectId
from app.config.database import db

publications_collection = db["publications"]


def serialize_publication(publication):
    return {
        "id": str(publication["_id"]),
        "user_id": str(publication["user_id"]),
        "title": publication["title"],
        "journal": publication["journal"],
        "year": publication["year"],
        "doi": publication["doi"]
    }


# GET all publications
def get_publications():
    publications = publications_collection.find()

    return [
        serialize_publication(publication)
        for publication in publications
    ]


# GET publication by ID
def get_publication(publication_id):
    if not ObjectId.is_valid(publication_id):
        return None

    publication = publications_collection.find_one(
        {"_id": ObjectId(publication_id)}
    )

    if publication:
        return serialize_publication(publication)

    return None


# UPDATE publication
def update_publication(publication_id, publication_data):
    if not ObjectId.is_valid(publication_id):
        return None

    update_data = {
        key: value
        for key, value in publication_data.items()
        if value is not None
    }

    result = publications_collection.update_one(
        {"_id": ObjectId(publication_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return None

    return get_publication(publication_id)


# DELETE publication
def delete_publication(publication_id):
    if not ObjectId.is_valid(publication_id):
        return None

    result = publications_collection.delete_one(
        {"_id": ObjectId(publication_id)}
    )

    if result.deleted_count == 0:
        return None

    return True