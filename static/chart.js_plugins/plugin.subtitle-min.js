!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("chart.js")):"function"==typeof define&&define.amd?define(["chart.js"],e):t.PluginSubtitle=e(t.Chart)}(this,function(t){"use strict";var e={display:!1,fontSize:12,fontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",fontColor:"#888",fontStyle:"normal",paddingTop:4,text:""},i={id:"chartJsPluginSubtitle",resolveStyle:function(t){if(!("string"==typeof t.fontStyle||t.fontStyle instanceof String))return"";switch(t.fontStyle.toLowerCase()){case"normal":return"";default:return t.fontStyle}},resolveSize:function(t){var e=t.fontSize;return"string"==typeof e||e instanceof String?e:"number"==typeof e?e+"px":"12px"},resolveFont:function(t){return this.resolveStyle(t)+" "+this.resolveSize(t)+" "+t.fontFamily},drawTop:function(t,e){var i=e.text,o=t.ctx,r=t.width,n=t.titleBlock.height-t.options.title.padding,a=Math.round((r-o.measureText(i).width)/2),l=n+e.paddingTop+3;o.fillText(i,a,l)},drawLeft:function(t,e){var i=e.text,o=t.ctx,r=t.height,n=t.titleBlock.width-t.options.title.padding;o.save(),o.translate(0,0),o.rotate(-Math.PI/2);var a=Math.round((r+o.measureText(i).width)/2),l=n+e.paddingTop+3;o.fillText(i,-a,l),o.restore()},drawRight:function(t,e){var i=e.text,o=t.ctx,r=t.height,n=t.width,a=t.titleBlock.width-t.options.title.padding;o.save(),o.translate(0,0),o.rotate(Math.PI/2);var l=Math.round((r-o.measureText(i).width)/2),s=a+e.paddingTop-n;o.fillText(i,l,s),o.restore()},drawBottom:function(t,e){var i=e.text,o=t.ctx,r=t.height,n=t.width,a=Math.round((n-o.measureText(i).width)/2),l=r-2*t.options.title.padding+(e.paddingTop+11);o.fillText(i,a,l)},beforeDraw:function(t,i,o){var r=Object.assign({},e,o);if(r.display){var n=t.chart.ctx;switch(n.restore(),n.font=this.resolveFont(r),n.textBaseline="middle",n.fillStyle=r.fontColor,t.options.title.position){default:this.drawTop(t.chart,r);break;case"left":this.drawLeft(t.chart,r);break;case"right":this.drawRight(t.chart,r);break;case"bottom":this.drawBottom(t.chart,r)}}}};return(t=t&&t.hasOwnProperty("default")?t.default:t).pluginService.register(i),i});