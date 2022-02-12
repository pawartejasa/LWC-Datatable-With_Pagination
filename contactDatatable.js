import { LightningElement, wire, api, track } from 'lwc';
import getContacts from '@salesforce/apex/getContactsController.getContacts';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const columns = [
    {
        label: 'FirstName',
        fieldName: 'FirstName',
        type: 'text',
        editable: true,
        sortable: true,
        cellAttributes: { alignment: 'left' }
    }, {
        label: 'LastName',
        fieldName: 'LastName',
        type: 'text',
        editable: true,
        sortable: true,
        cellAttributes: { alignment: 'left' }
    }, {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
        editable: true,
        sortable: true
    },{
        label: 'Email',
        fieldName: 'Email',
        type: 'Email',
        editable: true,
        sortable: true
    }
];

export default class DemoApp extends LightningElement {
    
    @track contacts ;
    @api recordId;
    @track data;
    columns = columns;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    saveDraftValues = [];
    sortedBy;
    _wiredMarketData;

    @track page = 1; 
    @track items = []; 
    @track data2 = []; 
    //@track columns; 
    @track startingRecord = 1;
    @track endingRecord = 0; 
    @track pageSize = 2; 
    @track totalRecountCount = 0;
    @track totalPage = 0;


    @wire(getContacts,{FetchAccoutId: '$recordId'})
    cons(wireResult){
        const { data, error } = wireResult;
        this._wiredMarketData = wireResult;
        if(data){
        this.items = data;
        this.totalRecountCount = data.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        this.data = this.items.slice(0,this.pageSize); 
        this.endingRecord = this.pageSize;
         this.error = undefined;
        
        //console.log("Contacts",this.contacts);
        //console.log("items",data);
        //console.log("Length",this.contacts.length);
        }
        if (error) {
            this.contacts = undefined;
            this.data=undefined;
            console.log(error);
        }
    }
    //clicking on previous button this method will be called
    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }
    //this method displays records page by page
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);

        this.startingRecord = this.startingRecord + 1;
    }    
    // Used to sort the columns
    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }
    //first function which will get invoked when you click sort arrow.
    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    //to save the updated records to the database
    handleSave(event) {
        this.saveDraftValues = event.detail.draftValues;
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Records Updated Successfully!!',
                    variant: 'success'
                })
            );
            this.saveDraftValues = [];
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'An Error Occured!!',
                    variant: 'error'
                })
            );
        }).finally(() => {
            this.saveDraftValues = [];
        });
    }

    // This function is used to refresh the table once data updated
    async refresh() {
        this.page=1;
        await refreshApex(this._wiredMarketData);
    }

    
    
}