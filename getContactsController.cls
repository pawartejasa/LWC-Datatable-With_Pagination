public with sharing class getContactsController {
    @AuraEnabled(Cacheable=true)
    public static List <Contact> getContacts(ID FetchAccoutId) {
        String contList =  'SELECT Id, FirstName, LastName, Phone , Email, AccountId FROM Contact WHERE AccountId=\''+ FetchAccoutId +'\'' ;
        return database.query(contList);
    }   
}

