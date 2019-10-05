import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm } from '@angular/forms';
import {  CurrencyPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map'
import { LocalStorageService } from 'ngx-webstorage';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent  {
  name = 'Angular 8 reactive form with dynamic fields and validations example';
  exampleForm: FormGroup;
  totalSum: number = 0;
  myFormValueChanges$;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private storage: LocalStorageService,
    private currencyPipe: CurrencyPipe
  ) { }

  /**
   * Form initialization
   */
  ngOnInit () {
    // create form with validators and dynamic rows array
    this.exampleForm = this.formBuilder.group({
     
      units: this.formBuilder.array([
         // load first row at start
         this.getUnit()
      ])
    });
    // initialize stream on units
    this.myFormValueChanges$ = this.exampleForm.controls['units'].valueChanges;
    // subscribe to the stream so listen to changes on units
    this.myFormValueChanges$.subscribe(units => this.updateTotalUnitPrice(units));

    // preload some data into form fields
    // const geoIpInfo = this.storage.retrieve('geoIpInfo');
    // if(geoIpInfo) {
    //   this.exampleForm.patchValue({
    //     countryName: geoIpInfo.country_name,
    //     city: geoIpInfo.city,
    //     zipCode: geoIpInfo.postal,
    //     companyName: geoIpInfo.org
    //   });
    // } else {
    //   // this.getCountryByIpOnline().subscribe((res) => {
    //   //     console.log('This is your IP information: ', res );
    //   //     // put responce into storage so no nedded request it again on reload
    //   //     this.storage.store('geoIpInfo', res); 
    //   //     // update form data
    //   //     this.exampleForm.patchValue({
    //   //       countryName: res.country_name,
    //   //       city: res.city,
    //   //       zipCode: res.postal,
    //   //       companyName: geoIpInfo.org
    //   //     });  
    //   // }, (err) => {
    //   //     this.exampleForm.patchValue({countryName: 'N/A', city: 'N/A', zipCode: 'N/A'});
    //   // });
    //   console.log("error")
    // }
  }

  /**
   * unsubscribe listener
   */
  ngOnDestroy(): void {
    this.myFormValueChanges$.unsubscribe();
  }

  /**
   * Save form data
   */
  save(model: any, isValid: boolean, e: any) {
    e.preventDefault();
    alert('Form data are: ' + JSON.stringify(model["units"]));
    var data={
      itemss:JSON.stringify(model["units"]),
      tot:this.totalSum
    }
    const y= this.http.post('http://127.0.0.1:5002/sendMail',data).subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log("Error occured");
      }
    );

  }

  /**
   * Create form unit
   */
  private getUnit() {
    const numberPatern = '^[0-9.,]+$';
    return this.formBuilder.group({
      'unitName': ['', Validators.required],
      'qty': [1, [Validators.required, Validators.pattern(numberPatern)]],
      'unitPrice': [0, [Validators.required, Validators.pattern(numberPatern)]],
      'unitTotalPrice': [{value: '', disabled: false}]
    });
  }

  /**
   * Add new unit row into form
   */
  addUnit() {
    const control = <FormArray>this.exampleForm.controls['units'];
    control.push(this.getUnit());
  }

  /**
   * Remove unit row from form on click delete button
   */
  removeUnit(i: number) {
    const control = <FormArray>this.exampleForm.controls['units'];
    control.removeAt(i);
  }

  /**
   * This is one of the way how clear units fields.
   */
  clearAllUnits() {
    const control = <FormArray>this.exampleForm.controls['units'];
    while(control.length) {
      control.removeAt(control.length - 1);
    }
    control.clearValidators();
    control.push(this.getUnit());
  }

  /**
   * This is example how patch units array. Before patch you have to create 
   * same number of FormArray controls. As we have already one control created
   * by default we start from i = 1 not 0. This way it could be implemented in 
   * ngOnInit in case of update just you have to prepare FormArray and then patch
   * whole form object not just units.
   */
  addSomeUnitsFromArrayExample() {
    const unitsArray = [
      {unitName: 'test unit 1', qty: 2, unitPrice: 22.44},
      {unitName: 'test unit 2', qty: 1, unitPrice: 4},
      {unitName: 'test unit 3', qty: 44, unitPrice: 1.50}
    ]
    const control = <FormArray>this.exampleForm.controls['units'];
    for (let i = 1; i < unitsArray.length; i++) {
      control.push(this.getUnit());
    }
    this.exampleForm.patchValue({units: unitsArray});
  }

  /**
   * Update prices as soon as something changed on units group
   */
  private updateTotalUnitPrice(units: any) {
    // get our units group controll
    const control = <FormArray>this.exampleForm.controls['units'];
    // before recount total price need to be reset. 
    this.totalSum = 0;
    for (let i in units) {
      let totalUnitPrice = (units[i].qty*units[i].unitPrice);
      // now format total price with angular currency pipe
      let totalUnitPriceFormatted = this.currencyPipe.transform(totalUnitPrice, 'USD', 'symbol-narrow', '1.2-2');
      // update total sum field on unit and do not emit event myFormValueChanges$ in this case on units
      control.at(+i).get('unitTotalPrice').setValue(totalUnitPriceFormatted, {onlySelf: true, emitEvent: false});
      // update total price for all units
      this.totalSum += totalUnitPrice;
    }

    console.log(control.value)
  }

  /**
   * Get online geoIp information to pre-fill form fields country, city and zip 
   */
  // private getCountryByIpOnline(): Observable<any> {
  //   return this.http.get('https://ipapi.co/json/')
  //       .map(this.extractData)
  //       .catch(this.handleError);
  // }

  /**
   * responce data extraction from http responce
   */
  private extractData(res: Response) {
    let body = res.json();
    return body || { };
  }

  /**
   * handle error if geoIp service not available. 
   */
  private handleError (error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    // if (error instanceof Response) {
    //   const body = error.json() || '';
    //   const err = body.error || JSON.stringify(body);
    //   errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    // } else {
    //   errMsg = error.message ? error.message : error.toString();
    // }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
