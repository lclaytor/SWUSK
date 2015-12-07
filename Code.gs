//Variable for data input and retrieval
var dataSheetID = '16FcE0BUpty0QTeVinrLD0SOUPkkbFAZ2qh5fnwwpATU';
//ID of spreadsheet with questions
var qSheetID = '1ddnyYPo3Qy1ZFFWCsOKh6BGUH2ZT411ItGEAx7AJ0Wo';
//ID of spreadsheet with emails
var emailSheetID  = '1Q_6nzfqEJKunmaD6wlD_yLB-7zcCShJQL0BJUzKgW-c';

//Sets up web app so that our gadget will work within the Google App interface
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index').setSandboxMode(HtmlService.SandboxMode.IFRAME)
}

//Get question data from spreadsheet (Thought this might be an easier way for our users to change their answers.)
function getData(sheetID) {
  return SpreadsheetApp
  .openById(sheetID)
      .getActiveSheet()
      .getDataRange()
      .getValues();
}


//This is supposed to make a log of our outputs for later review. I can't get it to work, but coult be useful if someone can.
//function myFunction() {
//  Logger.log(HtmlService
//    .createTemplateFromFile('index')
//    .getCode());
//}


//Handles an array of Strings containing the responses from the user
//Performs alert check
function handleData(responses){
  if(responses.length==0)
    return;
  
  //Check for 1s in the responses and send alert if any are found
  var alertFlag = false;
  for(i=0; i<responses.length-1; i++)
    if(responses[i] == "1")
      alertFlag = true;
  
  if(alertFlag)
    sendAlert(responses);
  
  
  // Add current date as the first entry in the row
  var date = getDate();
  responses.unshift(date);
  
  //Append data to active sheet
  addData(responses);
  
  //Calculate and Append statistics
  calculateStats(responses);
}

//function getCurrentSheet() {
  
//}

//Sends a link to the current sheet to the specified e-mail
function sendSheet() {
  // create spreadsheet
  var doc = SpreadsheetApp.openById(dataSheetID);

  //get emails to send sheet
  var emailList = getData(emailSheetID);
  
  // PLACEHOLDER uses Austin's e-mail
 // var email = "austin.taing001@gmail.com";

  // doc name for subject
  var subject = doc.getName();

  // link spreadsheet
  var body = 'Link to spreadsheet: ' + dataSheetID;

  // send mail
  for(j=0; j<emailList.length-1; j++)
    GmailApp.sendEmail(emailList[j+1], subject, body);
}

//Sends alert containing single feedback result
//contents is an array containing the user's responses
function sendAlert(contents) {
  //PLACEHOLDER for alert e-mail
  var emailList = getData(emailSheetID);
 // var email = "austin.taing001@gmail.com";
  var subject = "Negative Feedback Alert";
  var body = "";
  var questions = getData(qSheetID);
  
  //Formats user's numeric responses to go with the questions
  for(i=0; i<contents.length-1; i++)
    body = body + questions[i] + ' ' + contents[i] + '\n';
  
  //Adds user's extra comments
  body = body + "Additional comments:\n";
  body = body + contents[contents.length-1];
  
  for(j=0; j<emailList.length-1; j++)
    GmailApp.sendEmail(emailList[j+1], subject, body);
}


//Appends contents to the current spreadsheet as a new row
function addData(contents) {
  //PLACEHOLDER opens currently active sheet
  var sheet = SpreadsheetApp.openById(dataSheetID).getSheets(); 
  sheet[0].appendRow(contents);
}

//Function to get Date & Time
function getDate(){
  var d = new Date();
  var dateofDay = new Date(d.getTime());
  return Utilities.formatDate(dateofDay, "GMT-5", "MM-dd-yyyy");
}

//Not used outside of testing
function testStats()
{
  //fake data
  var data = [getDate(),1,2,4,""];
  calculateStats(data);
}

//Calculate statistics and update the data sheet --- Needs refactoring
function calculateStats(newData){
  //get the whole sheet
  var sheetData = SpreadsheetApp.openById(dataSheetID).getSheets();
  //Used for checking if the month has changed
  var d = new Date();
  //number of Qs can be passed later
  var numQs=3;
 //get the data from the column with all data stats
  var stats = sheetData[1].getRange(2, 3, 1, 18);
  //the formula for the average response to a question
  var averageQForm = "=ROUND((R[0]C[1]*1+R[0]C[2]*2+R[0]C[3]*3+R[0]C[4]*4+R[0]C[5]*5)/Sum(R[0]C[1]:R[0]C[5]),2)";
  
  var cell;
  
  //for the number of questions - can generalize
  for(i=1;i<=numQs;i++)
  {
    //force the proper formula on the first row
    cell = stats.getCell(1, (6*(i-1)+1));
    cell.setFormulaR1C1(averageQForm);
    //update the raw stats for first row
    cell = stats.getCell(1,((newData[i]+1)+6*(i-1)));
    cell.setValue(cell.getValue()+1);
  }
  
  
  //get the last row to check the month
  stats = sheetData[1].getRange(sheetData[1].getLastRow(),1,1,20);
  //get the month cell
  cell = stats.getCell(1,1);
  //get the current month and year
  var m = d.getMonth();
  var y = d.getYear();
  //m=0; //for testing
  //if the month has changed from the last entry
  if ((m+1>cell.getValue())||(cell.getValue()==12&&m==0)||(sheetData[1].getLastRow()==2))
  {
    //add a new line for this month
    
    //start a new line to append
    var newRow = [m+1,y];
    //for the number of questions
    for(j=1;j<=numQs;j++)
    {
      newRow.push("");
      newRow.push(0);
      newRow.push(0);
      newRow.push(0);
      newRow.push(0);
      newRow.push(0);
    }
    //add the row
    sheetData[1].appendRow(newRow);
    //get the row in order to copy the formula
    stats = sheetData[1].getRange(sheetData[1].getLastRow(),1,1,20);
   // for the number of questions
    for(l=1;l<=numQs;l++)
    {
      //copy the formula
      cell = stats.getCell(1, 3+6*(l-1));
      cell.setFormulaR1C1(averageQForm);
    }
  }
  //get the data region of the current period
  stats = sheetData[1].getRange(sheetData[1].getLastRow(),3,1,18);
  //for the number of questions
  for(k=1;k<=numQs;k++)
  {
    //add the values to the current period
    cell = stats.getCell(1,((newData[k]+1)+6*(k-1)));
    cell.setValue(cell.getValue()+1);
  }
  
}
