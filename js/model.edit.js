// Lamenting Globule 0.0 (Apathetic Amoeba)
// Voxel Model Editor
// lg.model.edit
// (c) 2011 Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!TODO
/*
 * Toolbar
 * Load palette
 * Select Voxel(s)
 * Pick selected color
 * z-sort no perspective views
 * Erase tool
 * Move tool (move shortcuts as well)
 * Mirror tool (per view) (Draws a mirror image of what you are drawing)
 * Stretch tool
 * Sphere Tool
 * Box Tool
 * Fill Tool
 * Import image as voxels
 * Import image as reference
 * Hollow tool - discards extra voxels
 * 'parent' node - a node that a part can be connected to
 * Add more 'parts'
 * Allow specifying 'shinyness' of voxels
 * 
 */


function lgModelEdit(o){this.anch=new createAnchor(this);this.model=new lgModel();this.ii=new lgInputInterface();this.ii.editor=this;this.colorClass=new lgColor();this.gui=new lgGUI();this.toolbarElement=dg("toolbar",document.body,"div",{style:{zIndex:2,position:"absolute",top:"0px"}});this.toolbarCallback=function(o,d,e){if(o.action=="selected"){e.setSelectedTool(o.selected)}else if(o.action=="click"){switch(o.name){case"load":e.gui.createDialouge({viewType:"alert",t:"fileOpen",folder:"voxel",clickToChoose:true,filter:{selectable:"file-ext:obj"},callback:function(o,a,b){switch(o.action){case"choose":b.load(o.data.path[0],b);this.gui.remove(this.handle);break}}},e);break;case"save":if(e.saveName){e.save();break}case"save-as":e.gui.createDialouge({viewType:"alert",t:"fileSave",folder:"voxel",file:e.saveName,clickToChoose:true,filter:{selectable:"file-ext:obj"},callback:function(o,a,b){switch(o.action){case"save":b.saveName=a.folder+"/"+(a.path?a.path+"/":"")+a.file;b.save();this.gui.remove(this.handle);break}}},e);break;case"render":if(document.getElementById("renderCanvas")){document.body.removeChild(document.getElementById("renderCanvas"))}e.anim=[];for(var a=0;a<Math.PI*2;a+=Math.PI*1/4){var f=this.ob.model.render(a);var g=8;var h=document.createElement('canvas');h.setAttribute('width',f.canvas.width*g);h.setAttribute('height',f.canvas.height*g);var i=h.getContext('2d');var j=new this.ob.model.pixelData(f);for(var y=0;y<f.canvas.height;y++){for(var x=0;x<f.canvas.width;x++){var c=j.get(x,y);if(c.a){i.fillStyle="#"+dec2Hex(c.r,2)+dec2Hex(c.g,2)+dec2Hex(c.b,2);i.fillRect(x*g,y*g,g,g)}}}i.canvas.style.position="absolute";i.canvas.style.left=((1680/2)-Math.floor(i.canvas.width/2))+"px";i.canvas.style.top="100px";i.canvas.style.backgroundColor="#FFFFFF";i.canvas.style.border="1px solid #000000";i.canvas.id="renderCanvas";i.canvas.zIndex=10000;document.body.appendChild(i.canvas);e.anim.push(h)}setInterval("rotateIt()",1000);break}}};this.toolbarView=this.gui.createView({parentElement:this.toolbarElement,layout:[{t:"toolGroup",title:"File",path:"images/icons/",data:[{t:"icon",name:"load",data:{img:"actions/document-open",title:"Load Model"}},{t:"icon",name:"save",data:{img:"actions/document-save",title:"Save Model"}},{t:"icon",name:"save-as",data:{img:"actions/document-save-as",title:"Save Model As..."}},{t:"icon",name:"help",data:{img:"apps/help-browser",title:"How To Use",href:"./?lgVoxelEditor",target:"_blank"}},{t:"icon",name:"render",data:{img:"draw/render",title:"Render Model"}}]},{name:"draw",t:"toolGroup",selectable:1,title:"Tools",path:"images/icons/",data:[{t:"icon",name:"select",data:{img:"draw/select",title:"Select"}},{t:"icon",name:"move",data:{img:"draw/move",title:"Move"}},{t:"icon",name:"voxel",data:{img:"draw/voxel",title:"Voxel"}},{t:"icon",name:"color",data:{img:"draw/color",title:"Color"}},{t:"icon",name:"fill",data:{img:"draw/fill",title:"Fill"}},{t:"icon",name:"basePoint",data:{img:"draw/basePoint",title:"basePoint"}}]}],callback:this.toolbarCallback},this);this.consoleLog=function(t){if(this.consoleElement){this.consoleLines.push(t);if(this.consoleLines.length>this.consoleLimit){this.consoleLines.shift()}this.consoleElement.value=this.consoleLines.join("\n");this.consoleElement.scrollTop=this.consoleElement.scrollHeight}};this.setStatus=function(t){if(this.statusElement!==null){this.statusElement.innerHTML=t}};this.padNumber=function(n){var n=String(n).split(".");if(n.length==1)n.push("0");n[1]=n[1].substr(0,3);while(n[0].length<4){n[0]=" "+n[0]}while(n[1].length<3){n[1]+="0"}return n.join(".")};this.prepForSave=function(){this.viewAdjustable.rotate=!!this.viewAdjustable.rotate;this.model.prepForSave()};this.save=function(){var a=new lgFile();a.save(this.saveName,this)};this.load=function(a){this.cleanUp();var b=new lgFile();b.load(a,this)};this.postLoad=function(){if(this.viewAdjustable.rotate){this.startRotate()}this.redraw()};this.cleanUp=function(){try{clearInterval(this.viewAdjustable.rotate)}catch(e){}};this.setOptions=function(o){for(i in o){var n="set"+i.charAt(0).toUpperCase()+i.substr(1);if(this[n]){this[n](o[i])}else{this[i]=o[i]}}};this.setCtx=function(c){this.model.ctx=this.ctx=c;if(c!==null){if(!this.cursorCtx){var d=document.createElement('canvas');d.setAttribute('width',64);d.setAttribute('height',64);this.cursorCtx=d.getContext('2d')}this.ii.setTarget(c.canvas,function(r,n,e){var a=this.editor[r];if(r=="parent"){if(n=="keydown"){switch(e){case"m":this.editor.drawXYZMarker=!this.editor.drawXYZMarker;this.editor.refreshAllViews();break;case"l":this.editor.drawCurrentSliceOnly=!this.editor.drawCurrentSliceOnly;this.editor.refreshAllViews();break;case"delete":this.editor.model.removeNodes(this.editor.model.selectedNodes);this.editor.refreshAllViews();break}}}else{if(!a)return;if(a.t){if(n=="keydown"){var p=null;switch(e){case"w":var p=[0,-1,0];break;case"s":var p=[0,1,0];break;case"a":var p=[-1,0,0];break;case"d":var p=[1,0,0];break;case"r":var p=[0,0,-1];break;case"f":var p=[0,0,1];break}if(p){this.editor.model.moveNodes(this.editor.model.selectedNodes,this.editor.tranformDimensions(a.t,p));this.editor.refreshAllViews()}}this.editor.currentView=a;var b=this.editor.getCenterPoint(a,true);this.editor.cursor=this.editor.model.transformTo3D(e.x-Math.round(b.x+a.offX),e.y-Math.round(b.y+a.offY),a.zoom,a.t,this.editor.currentSlice);this.editor.cursor.x=Math.floor(this.editor.cursor.x);this.editor.cursor.y=Math.floor(this.editor.cursor.y);this.editor.cursor.z=Math.floor(this.editor.cursor.z);this.editor.setStatus(r+": (zoom:"+this.editor.padNumber(a.zoom)+", x:"+this.editor.padNumber(this.editor.cursor.x)+", y:"+this.editor.padNumber(this.editor.cursor.y)+", z:"+this.editor.padNumber(this.editor.cursor.z)+")  Node Count: "+this.editor.model.nodeCount);if(a.zoom!==undefined&&n=="zoom"){if(e.zoom>0){a.zoom*=1+(e.zoom/3)*(Math.pow(2,1/5)-1)}else if(e.zoom<0){a.zoom/=1-(e.zoom/3)*(Math.pow(2,1/5)-1)}if(Math.abs(a.zoom-1)<0.0001){a.zoom=1}this.editor.setStatus(r+": (zoom:"+this.editor.padNumber(a.zoom)+")");this.editor.refreshView(a)}this.editor.refreshCursor()}if(a.t){if(n=="alt-down"){a.oldOffX=a.offX;a.oldOffY=a.offY}else if(n=="alt-drag"){a.offX=a.oldOffX+e.movedX;a.offY=a.oldOffY+e.movedY;this.editor.refreshView(a)}}if(a.drawable){if(n=="move"){if(this.isKeyDown('shift')){this.editor.setSlice(a);this.editor.refreshAllViews()}this.editor.checkForOver(a)}if(n=="down"){this.editor.toolStart=true;this.editor.toolUse("start",a)}if(n=="drag"||n=="down"){this.editor.toolUse("update",a)}if((n=="out"||n=="up")&&this.editor.toolStart){this.editor.toolStart=false;this.editor.toolUse("stop",a)}}}this.editor[r+"InputEvent"](n,e)})}};this.setBounds=function(a,b,c,d){return{x1:a,y1:b,x2:c,y2:d,w:c-a,h:d-b,xc:(a+c)/2,yc:(b+d)/2}};this.setConsoleElement=function(a){this.consoleLines=[];this.consoleElement=a;this.consoleLog("Lamenting Globule 0.0 (Apathetic Amoeba)\nVoxel Model Editor\nConsole started.\n")};this.setStatusElement=function(a){this.statusElement=a};this.setSelectedTool=function(a){if(this.selectedTool!=a){this.selectedTool=a;this.gui.view(this.toolbarView).getElement("draw").o.select(a)}};this.setOptions({cursorCtx:null,ctx:null,width:0,height:0,hGuides:[],vGuides:[],currentView:null,viewToolbar:{type:"toolbar",ul:1},viewPalette:{type:"palette",ul:1},palette:null,selectedColor:[0,0,0],viewTop:{drawable:1,zoom:8,center:1,offX:0,offY:0,t:[1,0,0,0,1,0]},viewSide:{drawable:1,zoom:8,offX:0,offY:0,t:[0,1,0,0,0,-1]},viewFront:{drawable:1,zoom:8,offX:0,offY:0,t:[1,0,0,0,0,-1]},viewAdjustable:{zoom:8,offX:0,offY:0,t:[1,0,0,0,(2/3),-1,1],shade:1},lastZSortAngle:0,adjustableViewAngle:0,adjustableViewSkew:(2/3),adjustableViewRotateSpeed:(Math.PI/48),consoleLimit:100,consoleElement:null,statusElement:null,cursor:{x:0,y:0,z:0},currentSlice:{x:0,y:0,z:0},drawCurrentSliceOnly:true,drawXYZMarker:true,sliceSize:64,snap:1,nodeSnap:5,overNode:null,selectedNode:null,selectedTool:"voxel",saveName:"",saveVars:["viewToolbar","viewPalette","palette","selectedColor","viewTop","viewSide","viewFront","viewAdjustable","adjustableViewAngle","adjustableViewSkew","adjustableViewRotateSpeed","cursor","currentSlice","drawCurrentSliceOnly","drawXYZMarker","sliceSize","snap","nodeSnap","selectedTool","saveName","model.nodes","model.nodeCount","model.startA1","model.startA2"]});this.parentInputEvent=function(){};this.viewToolbarInputEvent=function(n,e){};this.viewPaletteInputEvent=function(n,e){if(n=="down"){var c=((e.x/this.viewPalette.cellW)|0)*this.viewPalette.rows+((e.y/this.viewPalette.cellH)|0);this.setOptions({selectedColor:this.palette[c]})}};this.viewTopInputEvent=function(){};this.viewSideInputEvent=function(){};this.viewFrontInputEvent=function(){};this.viewAdjustableRotate=function(){this.setAdjustableViewAngle(this.adjustableViewAngle+this.adjustableViewRotateSpeed)};this.viewAdjustableInputEvent=function(n,e){switch(n){case"dbldown":if(this.viewAdjustable.rotate){clearInterval(this.viewAdjustable.rotate);this.viewAdjustable.rotate=null}else{this.startRotate()}break;case"down":this.viewAdjustable.oldAngle=this.viewAdjustable.rotate?this.adjustableViewRotateSpeed:this.adjustableViewAngle;break;case"drag":if(!this.ii.isKeyDown("space")){var v=this.viewAdjustable.oldAngle+e.movedX/(this.viewAdjustable.bounds.w/(Math.PI*3));if(this.viewAdjustable.rotate){this.adjustableViewRotateSpeed=v}else{this.setAdjustableViewAngle(v)}}break}};this.startRotate=function(){this.viewAdjustable.rotate=setInterval(this.anch.callbackCode("viewAdjustableRotate"),100)};this.checkForOver=function(a){var b=this.model.allNodes();var c=this.nodeSnap;var d=this.overNode;this.overNode=null;for(var i=0;i<b.length;i++){switch(this.getsliceDimension(a.t)){case 1:if(b[i].x==this.currentSlice.x&&b[i].y==this.cursor.y&&b[i].z==this.cursor.z){this.overNode=b[i]}break;case 2:if(b[i].x==this.cursor.x&&b[i].y==this.currentSlice.y&&b[i].z==this.cursor.z){this.overNode=b[i]}break;case 3:if(b[i].x==this.cursor.x&&b[i].y==this.cursor.y&&b[i].z==this.currentSlice.z){this.overNode=b[i]}break}if(this.overNode)break}if(this.overNode!=d){this.model.setSelectedNodes([this.overNode]);this.refreshAllViews()}};this.toolUse=function(a,b){if(!this.ii.isKeyDown("space")){if(this.cursor){this.setSlice(b);switch(this.selectedTool){case"voxel":this.viewAdjustable.t[6]=1 if(this.model.addNode(false,{t:this.model.typeByName(this.selectedTool),x:this.cursor.x,y:this.cursor.y,z:this.cursor.z,f:this.colorClass.convert(this.selectedColor,"ByteRGB","IntRGB")})){break}case"color":this.model.colorNode({x:this.cursor.x,y:this.cursor.y,z:this.cursor.z,f:this.colorClass.convert(this.selectedColor,"ByteRGB","IntRGB")});break}this.refreshAllViews()}}};this.setSlice=function(a){if(!!a.t[0]||!!a.t[3]){this.currentSlice.x=this.cursor.x}if(!!a.t[1]||!!a.t[4]){this.currentSlice.y=this.cursor.y}if(!!a.t[2]||!!a.t[5]){this.currentSlice.z=this.cursor.z}};this.getCenterPoint=function(a,b){if(a.ul){return{x:a.bounds.x1,y:a.bounds.y1}}return{x:a.bounds.xc-(b?a.bounds.x1:0),y:(a.center?a.bounds.yc:(a.bounds.yc+a.bounds.y2)/2)-(b?a.bounds.y1:0)}};this.getsliceDimension=function(t){if(!t[0]&&!t[3])return 1;if(!t[1]&&!t[4])return 2;if(!t[2]&&!t[5])return 3;return 0};this.tranformDimensions=function(a,b){var x=a[0]+a[1]+a[2];var y=a[3]+a[4]+a[5];switch(this.getsliceDimension(a)){case 1:return[b[2],x*b[0],y*b[1]];case 2:return[x*b[0],b[2],y*b[1]];case 3:return[x*b[0],y*b[1],b[2]]}};this.refreshView=function(a){this.ctx.fillStyle="#FFFFFF";this.ctx.fillRect(a.bounds.x1,a.bounds.y1,a.bounds.w,a.bounds.h);this.setView(this.ctx,a);switch(a.type){case"palette":if(this.palette){a.cellW=a.bounds.w/a.cols;a.cellH=a.bounds.h/a.rows;var i=0;var w=a.cellW,h=a.cellH;for(var x=0;x<a.cols;x++){for(var y=0;y<a.rows;y++){var p=this.palette[i];this.ctx.beginPath();this.ctx.fillStyle="rgb("+p[0]+","+p[1]+","+p[2]+")";this.ctx.fillRect(w*x,h*y,w,h);i++}}}break;case"toolbar":dg("toolbar").style.width=a.bounds.w+"px";dg("toolbar").style.height=a.bounds.h+"px";break;default:if(a==this.viewAdjustable&&0){this.model.render(a.t,a.bounds.w,a.bounds.h)}else{if(this.drawXYZMarker){this.ctx.lineWidth=0.75;var o=[{l:"x",c:"#0000FF"},{l:"y",c:"#00FF00"},{l:"z",c:"#FF0000"}];for(var i=0;i<3;i++){this.ctx.beginPath();this.ctx.fillStyle=this.ctx.strokeStyle=o[i].c;var p=this.model.transformTo2D(0,0,0,a.zoom,a.t);this.ctx.moveTo(p.x,p.y);var p=this.model.transformTo2D(i==0?8:0,i==1?8:0,i==2?8:0,a.zoom,a.t);this.ctx.lineTo(p.x,p.y);this.ctx.stroke();this.ctx.font="bold 12px sans-serif";var p=this.model.transformTo2D(i==0?10:0,i==1?10:0,i==2?10:0,a.zoom,a.t);var m=this.ctx.measureText(o[i].l);this.ctx.fillText(o[i].l,p.x-(m.width/2),p.y-5)}}this.model.draw(0,0,a.zoom,a.t,false,false,this.drawCurrentSliceOnly?this.getsliceDimension(a.t):0,this.currentSlice,a.shade);if(a.drawable){this.ctx.strokeStyle="rgba(0,0,0,0.05)";this.ctx.fillStyle="rgba(0,0,255,0.05)";if(!!a.t[0]||!!a.t[3]){this.model.drawCube(this.ctx,{x:this.currentSlice.x,y:-this.sliceSize,z:-this.sliceSize},{x:this.currentSlice.x+1,y:this.sliceSize,z:this.sliceSize},a.zoom,a.t)}this.ctx.fillStyle="rgba(0,255,0,0.05)";if(!!a.t[1]||!!a.t[4]){this.model.drawCube(this.ctx,{x:-this.sliceSize,y:this.currentSlice.y,z:-this.sliceSize},{x:this.sliceSize,y:this.currentSlice.y+1,z:this.sliceSize},a.zoom,a.t)}this.ctx.fillStyle="rgba(255,0,0,0.05)";if(!!a.t[2]||!!a.t[5]){this.model.drawCube(this.ctx,{x:-this.sliceSize,y:-this.sliceSize,z:this.currentSlice.z},{x:this.sliceSize,y:this.sliceSize,z:this.currentSlice.z+1},a.zoom,a.t)}}}break}this.ctx.restore();this.ctx.strokeStyle="#CCCCCC";this.ctx.beginPath();this.ctx.strokeRect(a.bounds.x1+0.5,a.bounds.y1+0.5,a.bounds.w,a.bounds.h);this.ii.refreshTarget()};this.setView=function(a,b){a.save();a.beginPath();a.rect(b.bounds.x1+1,b.bounds.y1+1,b.bounds.w-1,b.bounds.h-1);a.clip();var c=this.getCenterPoint(b);a.translate(c.x+(b.offX?b.offX:0),c.y+(b.offY?b.offY:0))};this.setPalette=function(d){var e=new Image();e.src=d;e.ob=this;e.onload=function(){var a=document.createElement('canvas');a.setAttribute('width',this.width);a.setAttribute('height',this.height);a.getContext('2d').drawImage(this,0,0);var b=a.getContext('2d').getImageData(0,0,this.width,this.height);var c=b.data;this.ob.palette=[];for(var i=0;i<c.length;i+=4){this.ob.palette.push([c[i],c[i+1],c[i+2]])}this.ob.viewPalette.cols=4;this.ob.viewPalette.rows=Math.ceil(this.ob.palette.length/this.ob.viewPalette.cols);this.ob.refreshView(this.ob.viewPalette)}};this.refreshCursor=function(a){if(a){this.cursorCtx.clearRect(a.bounds.x1,a.bounds.y1,a.bounds.w,a.bounds.h);this.setView(this.cursorCtx,a);this.cursorCtx.strokeStyle="rgba(0,0,0,0.5)";this.cursorCtx.fillStyle="rgba(0,0,0,0.2)";this.model.drawCube(this.cursorCtx,{x:this.cursor.x,y:this.cursor.y,z:this.cursor.z},{x:this.cursor.x+1,y:this.cursor.y+1,z:this.cursor.z+1},a.zoom,a.t);this.cursorCtx.restore()}else{this.refreshCursor(this.viewTop);this.refreshCursor(this.viewSide);this.refreshCursor(this.viewFront);this.refreshCursor(this.viewAdjustable)}};this.setAdjustableViewAngle=function(a){var b=Math.floor((a/Math.PI)*4);this.adjustableViewAngle=a;this.viewAdjustable.t=[Math.cos(a),-Math.sin(a),0,Math.sin(a)*(2/3),Math.cos(a)*(2/3),-1,b!=this.lastZSortAngle];if(b!=this.lastZSortAngle){this.lastZSortAngle=b}this.refreshView(this.viewAdjustable)};this.setAdjustableViewSkew=function(s){this.adjustableViewSkew=s;this.refreshView(this.viewAdjustable)};this.refreshAllViews=function(){this.refreshView(this.viewToolbar);this.refreshView(this.viewPalette);this.refreshView(this.viewTop);this.refreshView(this.viewSide);this.refreshView(this.viewFront);this.refreshView(this.viewAdjustable)}this.redraw=function(){this.width=this.ctx.canvas.width;this.height=this.ctx.canvas.height;this.ctx.fillStyle="#FFFFFF";this.ctx.fillRect(0,0,this.width,this.height);this.vGuides=[0,128,138,Math.round((138+this.width)/2),this.width-1];this.hGuides=[0,Math.round(this.height/2),this.height-1];this.viewToolbar.bounds=this.setBounds(this.vGuides[0],this.hGuides[0],this.vGuides[1],this.hGuides[1]);this.ii.defineRegion("viewToolbar",this.viewToolbar.bounds);this.viewPalette.bounds=this.setBounds(this.vGuides[0],this.hGuides[1],this.vGuides[1],this.hGuides[2]);this.ii.defineRegion("viewPalette",this.viewPalette.bounds);this.viewTop.bounds=this.setBounds(this.vGuides[2],this.hGuides[0],this.vGuides[3],this.hGuides[1]);this.ii.defineRegion("viewTop",this.viewTop.bounds);this.viewSide.bounds=this.setBounds(this.vGuides[3],this.hGuides[0],this.vGuides[4],this.hGuides[1]);this.ii.defineRegion("viewSide",this.viewSide.bounds);this.viewFront.bounds=this.setBounds(this.vGuides[2],this.hGuides[1],this.vGuides[3],this.hGuides[2]);this.ii.defineRegion("viewFront",this.viewFront.bounds);this.viewAdjustable.bounds=this.setBounds(this.vGuides[3],this.hGuides[1],this.vGuides[4],this.hGuides[2]);this.viewAdjustable.bounds.title="Drag to rotate view";this.viewAdjustable.bounds.style={cursor:"pointer"};this.ii.defineRegion("viewAdjustable",this.viewAdjustable.bounds);this.refreshAllViews()};if(o){this.setOptions(o)}};