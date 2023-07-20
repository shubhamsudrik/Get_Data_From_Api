
import { Component, OnInit } from '@angular/core';
import { CoreBase, IMIRequest, IMIResponse, IUserContext, MIRecord } from '@infor-up/m3-odin';
import { MIService, UserService } from '@infor-up/m3-odin-angular';


/*
Take input from user for customer order number (ORNO)
Use the ORNO and CONO as input for OIS100MI LstLine transaction
Input CONO and ORNO
Output PONR POSX ITNO ORQT and NLAM
*/

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})

export class AppComponent extends CoreBase implements OnInit {
      userContext = {} as IUserContext;
      isBusy = false;
      company: string;


      supplierNo :string;
      puNo:string;
      errormsg :string;
      lineNo:string='';
      lineSuffix:string='';
      ItemNumber :string='';
      itemNo:string='';
      itemDescription:string='';
      orderQuantity:string='';
      netAmount:string='';
      name:string='';

      orNo : string;
      poNr : string;
      coNo : string;
      poSx : string;
      itNo : string;
      orQt : string;
      nlAm : string;
      cuNm : string;
      itDs : string;
      lineitems : MIRecord[];
      litems : MIRecord[];

   constructor(private miService: MIService, private userService: UserService) {
      super('AppComponent');
   }

   ngOnInit() {

   }
   onClickLoad(): void {
     // console.log(this.puNo);
     console.log(this.itNo);

      console.log(this.orNo);

      if(this.company!==null){}
      this.logInfo('onClickLoad');

      this.setBusy(true);
      this.userService.getUserContext().subscribe((userContext: IUserContext) => {
         this.setBusy(false);
         this.logInfo('onClickLoad: Received user context');
         this.userContext = userContext;
         this.updateUserValues(userContext);
         this.callAllFunction();
      }, (error) => {
         this.setBusy(false);
         this.logError('Unable to get userContext ' + error);
      });
   }

   updateUserValues(userContext: IUserContext) {
      this.company = userContext.company;

   }

   private setBusy(isBusy: boolean) {
      this.isBusy = isBusy;
   }

   async callAllFunction() {
      this.OIS100MI_LstLine(this.company, this.orNo);
      this.MMS200MI_GetItmBasic(this.company, this.itNo);
    }

    MMS200MI_GetItmBasic(company: string, itemnumber: string) {
      const inputRecord = new MIRecord();
      inputRecord.setNumber("CONO", company);
      inputRecord.setNumber("ITNO", itemnumber);

      const request: IMIRequest = {
        program: "MMS200MI",
        transaction: "GetItmBasic",
        record: inputRecord,
        outputFields: ["ITDS"]
      };

      this.setBusy(true);
      this.miService.execute(request).subscribe((response: IMIResponse) => {
        this.setBusy(false);

        if (!response.hasError()) {
          const records: MIRecord[] = response.items as MIRecord[];
          records.forEach((record: MIRecord) => {
            const itemNumber = record["ITNO"];
            const matchingRecord = this.lineitems.find((r: MIRecord) => r["ITNO"] === itemNumber);
            if (matchingRecord) {
              matchingRecord["ITDS"] = record["ITDS"]; // Update ITDS from the response record
            }
          });
        }
      }, (response) => {
        console.log('Invalid Input')
      });
    }



    OIS100MI_LstLine(company: string, CustomerOrderNumber: string) {
      const inputRecord = new MIRecord();

      const companyName = company;
      inputRecord.setNumber("CONO", companyName);

      const cOrderNumber = CustomerOrderNumber;
      inputRecord.setNumber("ORNO", cOrderNumber);

      const request: IMIRequest = {
        program: "OIS100MI",
        transaction: "LstLine",
        record: inputRecord,
        outputFields: ["PONR", "POSX", "ITNO", "ORQT", "NLAM", "ITDS"] // outputFields
      };

      this.setBusy(true);
      this.miService.execute(request).subscribe((response: IMIResponse) => {
        this.setBusy(false);

        if (!response.hasError()) {
          this.lineitems = response.items as MIRecord[];
        }
      }, (response) => {
           console.log('Invalid Input')
      });
    }

   }
