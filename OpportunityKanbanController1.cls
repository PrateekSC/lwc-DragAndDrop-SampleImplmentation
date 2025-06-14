public with sharing class OpportunityKanbanController1 {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities() {
        return [SELECT Id, Name, Amount, StageName, CloseDate FROM Opportunity WHERE IsClosed = false];
    }

    @AuraEnabled
    public static void updateOpportunityStage(Id oppId, String newStage) {
        Opportunity o = [SELECT Id, StageName FROM Opportunity WHERE Id = :oppId];
        o.StageName = newStage;
        update o;
    }
}
