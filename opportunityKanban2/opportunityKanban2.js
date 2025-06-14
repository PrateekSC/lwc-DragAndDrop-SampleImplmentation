import { LightningElement, track, wire } from 'lwc';
import getOpportunities from '@salesforce/apex/OpportunityKanbanController1.getOpportunities';
import updateOpportunityStage from '@salesforce/apex/OpportunityKanbanController1.updateOpportunityStage';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';  

const STAGES = [
  'Prospecting',
  'Qualification',
  'Proposal/Price Quote',
  'Negotiation/Review',
  'Closed Won'
];

export default class OpportunityKanban2 extends NavigationMixin(LightningElement) {
  @track columns = [];
  @track refreshKey = 0;
  wiredResult;
  @track draggedOpportunityId;

  @wire(getOpportunities)
  wiredOpps(result) {
    this.wiredResult = result;
    if (result.data) {
      this.formatData(result.data);
    }
  }

  formatData(opportunities) {
    const grouped = STAGES.map(stage => {
      return {
        stage,
        opportunities: opportunities.filter(o => o.StageName === stage)
      };
    });

    this.columns = grouped;
  }

  handleDragStart(event) {
    this.draggedOpportunityId = event.target.dataset.id;
  }

  handleDrop(event) {
    const newStage = event.currentTarget.dataset.stage;
    const oppId = this.draggedOpportunityId;
    const currentStage = this.columns.find(col =>
      col.opportunities.some(o => o.Id === oppId)
    )?.stage;
    if (currentStage === newStage) {
        return; // Do nothing if dropped into the same stage
    } else {

    updateOpportunityStage({ oppId, newStage })
        .then(() => {
            this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: `Opportunity moved to ${newStage} successfully!`,
                variant: 'success',
            })
            );
            return refreshApex(this.wiredResult)
        })
        .then(() => this.formatData(this.wiredResult.data))
        .catch(err => {
            this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Failed to update the opportunity stage.',
                variant: 'error',
            })
            );
            console.error(err);
        });
    }
  }

  allowDrop(event) {
    event.preventDefault();
  }

  // Function to handle click on Opportunity Name
  handleOpportunityClick(event) {
    const oppId = event.target.dataset.id;
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: oppId,
        objectApiName: 'Opportunity',
        actionName: 'view'
      }
    });
  }
}
