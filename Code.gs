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

//function calculateStats(startDate,endDate){
  //var sheetData = SpreadsheetApp.openById(dataSheetID).getSheets();
 // var dates = sheetData[0].getSheetValues(2, 1,? , 1);
  
//}

//function addStats(stats)
//{
  //var sheet = SpreadsheetApp.openById(dataSheetID).getSheets();
  //sheet[1].appendRow(stats);
//}
