const span = document.createElement('SPAN')
const FtextNode = document.createTextNode("F:");
const GtextNode = document.createTextNode("G:");
const HtextNode = document.createTextNode("H:");

const Fspan = Object.assign(document.createElement('span'),{className: 'F'});
const Gspan = document.createElement('SPAN').setAttribute('class','G');
const Hspan = document.createElement('SPAN').setAttribute('class','H');

const sec = document.createElement('section').innerHTML = Fspan;
console.log(sec,"fpandigidgjifdjgidjgidgjidgjidgjidjgidjgidg");
var infoMapInnerHTML = sec;
//.append(Fspan).append(GtextNode).append(Gspan).append(HtextNode).append(Hspan)
document.getElementById("N").innerHTML +=infoMapInnerHTML;