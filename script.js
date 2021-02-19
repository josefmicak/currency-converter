function convert()
{
  var currency1 =  document.getElementById('currency1').value;
  var currency2 =  document.getElementById('currency2').value;
  var bothcurrencies = document.getElementById('currency1').value + "_" + document.getElementById('currency2').value;
  var amount =  document.getElementById('amount').value;
  var selectedDate = document.getElementById('selectedDate').value;
  document.getElementById('result-window').style.display = "inline-block";
  if(currency1 == currency2)
  {
    document.querySelector('.conversion-result').innerHTML = "Error: conversion is being made for the same two currencies.";
    document.querySelector('.conversion-result').style.color = "red";
  }
  else if(!isANumber(amount))
  {
    document.querySelector('.conversion-result').innerHTML = "Error: wrong amount input.";
    document.querySelector('.conversion-result').style.color = "red";
  }
  else if(document.getElementById("nottoday").checked && (!(EtoJSDate(selectedDate) instanceof Date) || isNaN(EtoJSDate(selectedDate).valueOf())))
  {
    document.querySelector('.conversion-result').innerHTML = "Error: wrong date input.";
    document.querySelector('.conversion-result').style.color = "red";
  }
  else if(document.getElementById("nottoday").checked && (Math.abs(numberOfDays(selectedDate)) > 365))
  {
    document.querySelector('.conversion-result').innerHTML = "Error: date older than one year";
    document.querySelector('.conversion-result').style.color = "red";
  }
  else
  {
    var newDate = new Date();
    var todayD = newDate.getDate() + "." + (newDate.getMonth() + 1) + "." + newDate.getFullYear();
    document.getElementById('result-window2').style.display = "inline-block";
    document.getElementById('result-window3').style.display = "inline-block";
    document.getElementById('result-window4').style.display = "inline-block";

    if (document.getElementById("today").checked)
    {
      fetch('https://free.currconv.com/api/v7/convert?q=' + bothcurrencies + '&compact=ultra&apiKey=5d4fe830a02767850cc4')
      .then(response => {
        return response.json();
     })
    .then(response =>{
       var result = eval("response." + bothcurrencies) * amount;
       document.querySelector('.conversion-result').innerHTML = todayD + " (today): " + amount + " " + currency1 + " = " + roundNumber(result) + " " + currency2;
       document.querySelector('.conversion-result').style.color = "black";
       document.querySelector('.values-header').innerHTML = "Conversions " + currency1 + " - " + currency2 + " at the date of " + todayD + ":";
       document.querySelector('.generated-values').innerHTML = generateValues(currency1, currency2, result / amount);
    })
 
    }
    else
    {  
      var formattedDate = selectedDate.split('.');
      formattedDate = formattedDate.reverse().join('-');
      fetch('https://free.currconv.com/api/v7/convert?apiKey=5d4fe830a02767850cc4&q=' + bothcurrencies + '&compact=ultra&date=' + formattedDate)    
      .then(response => {
        return response.json();
     })
    .then(response =>{
       var result = amount * eval("response." + bothcurrencies + "[\"" + formattedDate + "\"]");
       document.querySelector('.conversion-result').innerHTML = selectedDate + ": " + amount + " " + currency1 + " = " + roundNumber(result) + " " + currency2;
       document.querySelector('.conversion-result').style.color = "black";
       document.querySelector('.values-header').innerHTML = "Conversions " + currency1 + " - " + currency2 + " at the date of " + selectedDate + ":";
       document.querySelector('.generated-values').innerHTML = generateValues(currency1, currency2, result / amount);
    })
    }

   const today = new Date()
   const weekAgo = new Date(today)
   weekAgo.setDate(weekAgo.getDate() - 7)
   fetch('https://free.currconv.com/api/v7/convert?apiKey=5d4fe830a02767850cc4&q=' + bothcurrencies + '&compact=ultra&date=' + formatDate(weekAgo) + '&endDate=' + formatDate(today))
   .then(response => {
       return response.json();
    })
   .then(response =>{
       createGraph(response);
   })
  }
}

var myChart=null;
function createGraph(response)
{
  var currency1 =  document.getElementById('currency1').value;
  var currency2 =  document.getElementById('currency2').value;
  var bothcurrencies = document.getElementById('currency1').value + "_" + document.getElementById('currency2').value;
  var amount =  document.getElementById('amount').value;

  var myData = [];
  var myLabels = [];
  var maxValue = 0;
  var maxValueDate;
  var minValue = Number.MAX_SAFE_INTEGER;
  var minValueDate;
  var averageValue = 0;
  var firstPoint;
  var secondPoint;

  for(let i = 0; i < 8; i++)
  {
    const today = new Date()
    const yesterday = new Date(today)
      
    yesterday.setDate(yesterday.getDate() - i)
    var dateResult = amount * eval("response." + bothcurrencies + "[\"" + formatDate(yesterday) + "\"]");
    myLabels.push(AtoEDate(yesterday));
    myData.push(roundNumber(dateResult));

    if(dateResult > maxValue)
    {
      maxValue = dateResult;
      maxValueDate = AtoEDate(yesterday);
    }

    if(dateResult < minValue)
    {
      minValue = dateResult;
      minValueDate = AtoEDate(yesterday);
    }

    averageValue += dateResult;

    if(i == 0)
    {
      secondPoint = dateResult;
    }
    if(i == 7)
    {
      firstPoint = dateResult;
    }
  }
  document.querySelector('.low-point').innerHTML = roundNumber(minValue) + " (" + minValueDate + ")";
  document.querySelector('.high-point').innerHTML = roundNumber(maxValue) + " (" + maxValueDate + ")";
  document.querySelector('.average-point').innerHTML = roundNumber(averageValue / 8);
  var evaulation = secondPoint - firstPoint;
  if(roundNumber(evaulation) == 0)
  {
    document.querySelector('.evaulation').innerHTML = "The value of " + amount + " " + currency1 + " in " + currency2 +  " has not changed in the last week.";
  }
  else if(roundNumber(evaulation) > 0)
  {
    document.querySelector('.evaulation').innerHTML = "The value of " + amount + " " + currency1 + " has increased by " + roundNumber(evaulation) + " " + currency2 + " in the last week.";
  }
  else
  {
    document.querySelector('.evaulation').innerHTML = "The value of " + amount + " " + currency1 + " has decreased by " + Math.abs(roundNumber(evaulation)) + " " + currency2 + " in the last week.";
  }
  myLabels.reverse();
  myData.reverse();

  if(myChart!=null)
  {
    myChart.destroy();
  }
      myChart = new Chart(document.getElementById('line-chart'), {
        type: 'line',
        data: {
          labels: myLabels,
          datasets: [ { 
              data: myData,
              label: "The value of " + amount + " " + currency1 + " in " + currency2,
              borderColor: "#3cba9f",
              fill: false
            }, 
          ]
        },
        options: {
          title: {
            display: true,
            text: 'Graph visualizing currency rates in the last 7 days'
          }
        }
      });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function dateSwitch()
{
  if(document.getElementById("today").checked)
  {
    document.getElementById("selectedDate").disabled = true;
  }
  else
  {
    document.getElementById("selectedDate").disabled = false;
  }
}

function isANumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

function AtoEDate(date){
  var d = new Date(date);
  return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
}

function roundNumber(num)
{
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function generateValues(currency1, currency2, result)
{
  var values = [1, 5, 20, 50, 100];
  var returnString = "";
  for(var i = 0; i < values.length; i++)
  {
    returnString += values[i] + " " + currency1 + " = " + roundNumber(result * values[i]) + " " + currency2 + "<br>";
  }
  return returnString;
}

function numberOfDays(selectedDate)
{
  selectedDate = EtoJSDate(selectedDate);
  var today = new Date();
  var Difference_In_Time = selectedDate.getTime() - today.getTime(); 
  return Difference_In_Time / (1000 * 3600 * 24); 
}

function EtoJSDate(date)
{
  var parts = date.match(/(\d+)/g);
  if(parts == null)
  {
    return null;
  }
  else
  {
    return new Date(parts[2], parts[1]-1, parts[0]);
  }
}

function swapCurrencies()
{
  var currency1 =  document.getElementById('currency1').value;
  var currency2 =  document.getElementById('currency2').value;
  var temp = currency1;
  document.getElementById('currency1').value = currency2;
  document.getElementById('currency2').value = temp;
}