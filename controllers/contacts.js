const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    //#swagger.tags=['contacts']
    console.log("Received request body:", req.body);
    try {
        const result = await mongodb.getDatabase().db().collection('contacts').find();
        const contacts = await result.toArray();
        res.setHeader('content-Type', 'application/json');
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'An error occurred while retrieving contacts.', error: error.message });
    }
};

const getSingle = async (req, res) => {
    //#swagger.tags=['contacts']
    console.log("Received request body:", req.body);
    try {
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400).json('Must use a valid contact id to find a contact.');
          }
        const userId = new ObjectId(req.params.id);
        const result = await mongodb.getDatabase().db().collection('contacts').find({ _id: userId });
        
        const contacts = await result.toArray();
        
        if (contacts.length === 0) {
            return res.status(404).json({ message: 'Contact not found.' });
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(contacts[0]);
    } catch (error) {
        console.error('Error fetching contact:', error);
        if (error instanceof mongodb.MongoError && error.code === 121) {
            return res.status(400).json({ message: 'Invalid contact ID format.' });
        }
        res.status(500).json({ message: 'An error occurred while retrieving the contact.', error: error.message });
    }
};

const createContact = async (req, res) => {
    //#swagger.tags=['contacts']
    try {
        console.log("Received request body:", req.body);

        const contact = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            favoriteColor: req.body.favoriteColor,
            birthday: req.body.birthday
        };

        const existingContact = await mongodb.getDatabase().db().collection('contacts').findOne({ email: contact.email });

        if (existingContact) {
            const response = await mongodb.getDatabase().db().collection('contacts').updateOne(
                { email: contact.email },
                { $set: contact }
            );

            if (response.modifiedCount > 0) {
                return res.status(200).json({ message: 'Contact updated successfully.', contactId: existingContact._id });
            } else {
                return res.status(500).json({ message: 'Duplicate already exists.' });
            }
        } else {
            const response = await mongodb.getDatabase().db().collection('contacts').insertOne(contact);

            if (response.acknowledged) {
                return res.status(201).json({ message: 'Contact created successfully.', contactId: response.insertedId });
            } else {
                return res.status(500).json({ message: 'Some error occurred while inserting contact.' });
            }
        }
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ message: 'An error occurred while creating the contact.', error: error.message });
    }
};



const updateContact = async (req, res) => {
    //#swagger.tags=['contacts']
    try {
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400).json('Must use a valid contact id to update a contact.');
          }
        const userId = new ObjectId(req.params.id);
        const contact = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            favoriteColor: req.body.favoriteColor,
            birthday: req.body.birthday
        };

        const response = await mongodb.getDatabase().db().collection('contacts').replaceOne({ _id: userId }, contact);
        console.log(response);

        if (response.modifiedCount > 0) {
            return res.status(200).json({ message: 'Contact updated successfully.' });
        } else if (response.matchedCount === 0) {
            return res.status(404).json({ message: 'Contact not found.' });
        } else {
            return res.status(400).json({ message: 'No changes made to the contact.' });
        }
    } catch (error) {
        console.error('Error updating contact:', error);
        if (error instanceof mongodb.MongoError && error.code === 121) {
            return res.status(400).json({ message: 'Invalid contact ID format.' });
        }
        res.status(500).json({ message: 'An error occurred while updating the contact.', error: error.message });
    }
};

const deleteContact = async (req, res) => {
    //#swagger.tags=['contacts']
    console.log("Received request body:", req.body);
    try {
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400).json('Must use a valid contact id to delete a contact.');
          }
        const userId = new ObjectId(req.params.id);
        const response = await mongodb.getDatabase().db().collection('contacts').deleteOne({ _id: userId });

        if (response.deletedCount > 0) {
            return res.status(200).json({ message: 'Contact deleted successfully.' });
        } else {
            return res.status(404).json({ message: 'Contact not found.' });
        }
    } catch (error) {
        console.log(response);
        console.error('Error deleting contact:', error);
        if (error instanceof mongodb.MongoError && error.code === 121) {
            return res.status(400).json({ message: 'Invalid contact ID format.' });
        }
        res.status(500).json({ message: 'An error occurred while deleting the contact.', error: error.message });
    }
};

module.exports = {
    getAll,
    getSingle,
    createContact,
    updateContact,
    deleteContact
};