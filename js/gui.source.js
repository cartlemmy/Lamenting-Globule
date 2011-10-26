// Lamenting Globule [version]
// Graphical User Interface
// lg.gui
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

// Requires(lg.file)

//!CODE
function lgGUI(o) {
	this.sri = new serverRequestInterface(this,"lg.php");
	try { this.geshi = new lgGeshi(); } catch(e) {}
	try { this.dataManager = new lgData(); } catch(e) {}
	
	//Setters
	this.setOptions = function(o) {
		for (i in o) {
			var n = "set" + i.charAt(0).toUpperCase() + i.substr(1);
			if (this[n]) { // Has a setter
				this[n](o[i]);
			} else {
				this[i] = o[i];
			}
		}
	};
	
	//Set defaults
	this.setOptions({
		guiObjects:[],
		dontParseInner:"codedefine,code,pre,lit,anch",
		hasRelatedClass:"head,subhead,subsubhead,section,code,codedefine,codevar,page",
		noBrAfter:"head,subhead,subsubhead,code,codedefine,page,thead,tbody,tr,td,table,jump,lit,anch",
		layoutFunction:{head:"createAnchor",subhead:"createAnchor",toolGroup:"clearBoth"},
		tagTranslate:{
			br:{t:"br"},
			clear:{t:"div",a:{style:{clear:"both"}}},
			page:{t:"span"},
			lit:{t:"span"},
			b:{t:"span",a:{style:{fontWeight:"bold"}}},
			i:{t:"span",a:{style:{fontStyle:"italic"}}},
			u:{t:"span",a:{style:{textDecoration:"underline"}}},
			s:{t:"span",a:{style:{textDecoration:"line-through"}}},
			codevar:{t:"span"},
			pre:{t:"pre"},
			img:{t:"img",a:{src:"!data"}},
			text:{t:"span"},
			quote:{t:"blockquote",a:{innerHTML:"!data"}},// TODO: This needs to be betta
			size:{t:"span",a:{innerHTML:"!data",style:{fontSize:"!main"}}},
			color:{t:"span",a:{innerHTML:"!data",style:{color:"!main"}}},
			bgcolor:{t:"span",a:{innerHTML:"!data",style:{backgroundColor:"!main"}}},
			list:{t:"ul"},
			table:{t:"table"},
			thead:{t:"thead"},
			tbody:{t:"tbody"},
			tr:{t:"tr"},
			td:{t:"td",a:{className:"lgmltd"}},
			hr:{t:"hr"}
		},
		paramTranslate:{
			alt:"alt",
			title:"title",
			colspan:"colspan",
			rowspan:"rowspan",
			width:"style.width",
			height:"style.height",
			align:"style.cssFloat"
		}
	});
	
	// Remove
	this.remove = function(handle) {
		
		handle = this.getHandle(handle);
		
		var cont = this.getContainer(this.guiObjects[handle].element);
		cont.parentNode.removeChild(cont);
		
		this.guiObjects[handle] = null;
		//alert(debugObject(,"o",1));
	};
	
	// Events
	this.registerEvents = function(element,view,o,item) {
		if (o.selectable) { element.style.cursor = "pointer"; }
		
		o.element = element;
		element.ob = this;
		element.view = view;
		element.o = o;
		element.item = item;
		element.onclick = function(e) {
			var o = this.o;
			if (o.t == "collection") {
				this.ob.expandOrCollapse(this.view,this.o);
			} else if (this.view.clickToChoose) {
				if (o.selectable) {
					this.ob.doCallback(view,o,
						copyObject(o,{
							e:e,
							action:"choose"
						}
					));
				}
			} else {
				
			}
			this.ob.doCallback(this.view,o,
				copyObject(o,{
					e:e,
					action:"click"
				}
			));
			if (o.parent) {
				o.parent.select(o);
			}
		};
	};
	
	this.doCallback = function(view,o,cb1) {
		switch (cb1.action) {
			case "close":
			this.remove(view?view:cb1);
			break;
		}
		
		var possible = [o,o.data,view,cb1];
		
		for (var i in possible) {
			if (possible[i] && possible[i].callback) {
				possible[i].callback(cb1,view,view.ob);
			}
		}
	};
	
	// Filter
	this.filter = function(o,filter) {
		if (!filter || o.data == undefined) return true; // No filter, so return true
		
		var predefinedFilters = {
			"file-ext":"item.path[0].search(/\.[param]$/)",
			"mime-type":"//complex\npassed = true; var m = item.mime[0].split(';').shift().split('/'); var p = \"[param]\".split(\"/\"); for (var i in p) { if (p[i] != m[i]) { passed = false;} }"
		}
		
		var a = filter.split(":");
		if (predefinedFilters[a[0]]) {
			filter = predefinedFilters[a[0]].split("[param]").join(a[1]);
		}
		
		var item = o.data;
		var passed = false;
		
		try {
			eval(filter.substr(0,10) == "//complex\n" ? filter : "passed = ("+filter+");");
		} catch (e) {
			lgError(e,"Invalid filter\n"+filter);
			return true;
		}
		return passed;
	};
	
	// Dialouges
	this.createDialouge = function(o, ob) {
		if (!o.parentElement) {
			switch (o.viewType) {
				case "alert":
				o.parentElement = this.createViewContainerAlert(o);
				break;
				
				default:
				o.parentElement = document.body;
				break;
			}
		}
		switch (o.t) {
			case "fileOpen":
			var file = new lgFile(o);
			var o = optionDefaults(o,{
				title:"Open",
				layout:[
					{t:"treeView",data:file.getFolderContents(o.folder,true)}
				]
			});
			
			delete file;
			break;
			
			case "fileSave":
			var file = new lgFile(o);
			var o = optionDefaults(o,{
				title:"Save As",
				layout:[
					{t:"input",type:"text",label:"File Name",bind:"file",value:o.file}, 
					{t:"treeView",data:file.getFolderContents(o.folder,true)},
					{t:"button",action:"save",value:"Save"},
					{t:"button",action:"close",value:"Cancel"}
				]
			});
			
			delete file;
			break;
		}
		return this.createView(o,ob);
	};
	
	// View containers
	this.createViewContainerAlert = function(o) {
		
		var cont = dg("", document.body, "div",{
			style:{
				zIndex:10,
				position:"absolute",
				top:"0px",
				left:"0px",
				backgroundColor:"rgba(0,0,0,0.5)",
				width:docWidth()+"px",
				height:docHeight()+"px"
			},
			name:"lgViewContainer"
		});

		var titleCont = dg("", cont, "div",{
			style:{
				position:"absolute",
				overflow:"hidden",
				color:"#FFFFFF",
				fontWeight:"bold",
				fontSize:"16px",
				height:"24px"
			}
		});		
		
		dg("", titleCont, "div",{
			style:{
				cssFloat:"left",
			},
			innerHTML:"...",
			name:"lgTitle"
		});
		
		dg("", titleCont, "div",{
			style:{
				cssFloat:"right",
				border:"1px solid #FFFFFF",
				width:"16px",
				height:"16px",
				fontSize:"12px",
				textAlign:"center",
				cursor:"pointer"
			},
			innerHTML:"X",
			name:"lgClose"
		});
		
		var d = dg("", cont, "div",{
			style:{
				position:"absolute",
				backgroundColor:"#FFFFFF",
				overflowX:"hidden",
				overflowY:"auto"
			},
			updateSize:function() {
				var titleCont = this.parentNode.childNodes[0];
				
				var cn = this.childNodes[0] ? {w:this.clientWidth,h:this.clientHeight} : {w:200,h:200};
				cn.h += 15;
				titleCont.style.width = this.style.width = cn.w + "px";
				this.style.height = cn.h + "px";
				
				var y = Math.round((docHeight() / 2) - (cn.h / 2));
				titleCont.style.top = (y - 24) +"px";
				
				titleCont.style.left = this.style.left = Math.round((docWidth() / 2) - (cn.w / 2)) +"px";
				this.style.top = y +"px";
				
			},
			name:"lgViewContainerInner"
		});
		
		d.updateSize();
		return d;
	};
	
	this.updateContainer = function(o,p) {
		
		if (!p) {
			var p = this.getContainer(o.parentElement);
			if (!p) return;
		}
		
		var n = ["lgViewContainerInner","lgTitle","lgClose"];
		var c = p.childNodes;
		for (i in c) {
			for (j in n) {
				if (c[i].name == n[j]) {
					switch (Number(j)) {
						case 0: //lgViewContainerInner
							c[i].updateSize();
							break;
						case 1: //lgTitle
							c[i].innerHTML = o.title;
							break;
							
						case 2: //lgClose
							c[i].o = o;
							c[i].ob = this;
							c[i].onclick = function(e) {
								this.ob.doCallback(null,this.o,copyObject(this.o,{
									e:e,
									action:"close"
								}));
							}
							break;
					}
					break;
				}
			}
			if (c[i].childNodes && c[i].childNodes.length) {
				this.updateContainer(o,c[i]);
			}
		}
				
	};
	
	this.getContainer = function(cont) {
		while (cont.parentNode) {
			if (cont.name == "lgViewContainer") {
				return cont;
			}
			cont = cont.parentNode;
		}
		return null;
	};
		
	// Views / elements
	this.getHandle = function(o) {
		if (typeof(o) == "number") {
			return o;
		}
		return o.handle;
	};
	
	this.createView = function(view,ob) {
		view.ob = ob;
		if (!view.layout) { return false; }
		this.guiObjects.push(this.parseLayout(view.parentElement,view.layout,view));
		this.updateContainer(view);

		view.gui = this;
		return view.handle = this.guiObjects.length - 1;
	};
	
	this.view = function(handle) {
		return this.guiObjects[handle];
	};
	
	this.createTreeView = function(o, view) {
		if (!o.names) { o.names = this.dataManager.getColNames(o.data); }
		if (!o.classNames) {
			o.classNames = {
				"table":"lgTVTable",
				"headTr":"lgTVHeadTr",
				"headTd":"lgTVHeadTd",
				"bodyTr":"lgTVBodyTr",
				"bodyTd":"lgTVBodyTd",
				"bodyTrOdd":"lgTVBodyTrOdd",
				"branch":"lgTVBranch",
				"branchExpand":"lgTVBranchExpand"
			}
		}
		
		var d = dc('table');
		d.className = o.classNames["table"]?o.classNames["table"]:"";
		
		//Labels	
		var th = dc('thead');
		th.className = o.classNames["thead"]?o.classNames["thead"]:"";
		var tr = dc('tr');
		tr.className = o.classNames["headTr"]?o.classNames["headTr"]:"";
		
		for (var j in o.names) {
			var td = dc('td');
			td.className = o.classNames["headTd"]?o.classNames["headTd"]:"";
			td.innerHTML = o.names[j];
			tr.appendChild(td);
		}
		th.appendChild(tr);
		d.appendChild(th);
		
		var tb = dc('tbody');
		tb.className = o.classNames["tbody"]?o.classNames["tbody"]:"";
		this.createTreeBranch(d,o.data,o,view);
		d.appendChild(tb);
			
		return d;
	};
	
	this.expandOrCollapse = function(view,o) { //For tree view
		//alert("expandOrCollapse");
	};
	
	this.createTreeBranch = function(d,o,p,view,level,rowNum) {
		if (!level) { level = 0; }
		if (!rowNum) { rowNum = 0; }
		for (var i in o) {
			o[i].expanded = true; // Expand all for debugging
			
			o[i].selectable = this.filter(o[i], view.filterSelectable);
			
			var tr = dc('tr');
			tr.className = (p.classNames["bodyTr"]?p.classNames["bodyTr"]:"") + (rowNum & 1 && p.classNames["bodyTrOdd"] ? " "+p.classNames["bodyTrOdd"] : "");
			
			var first = true;
			for (var j in p.names) {
				var td = dc('td');
				td.className = p.classNames["bodyTd"]?p.classNames["bodyTd"]:"";
				
				if (first) {
					dg("",td,"div",{style:{width:(level*32)+"px",cssFloat:"left"},innerHTML:"&nbsp;"});
					if (o[i].data["collection"]) {
						dg("",td,"div",{style:{cssFloat:"left"},className:(p.classNames["branch"]+(o[i].expanded?" "+p.classNames["branchExpand"]:""))});
					}
				}
				
				dg("",td,"div",{style:{cssFloat:"left"},innerHTML:this.dataManager.dataObjectToText(o[i].data[j])});
				
				this.registerEvents(td,view,o[i],j);
				
				tr.appendChild(td);
				first = false;
			}
			
			d.appendChild(tr);
			rowNum++;
			
			if (o[i].data["collection"] && o[i].expanded) {
				rowNum = this.createTreeBranch(d,o[i].data["collection"][0],p,view,level+1,rowNum);
			}
		}
		return rowNum;
	};
	
	this.createToolGroup = function(o, view, parent) {
		var d = dg("",null,"div",{
			className:"toolGroup",
			style:{
			}
		});
		d.o = o;
		o.ob = this;
		o.view = view;
		o.select = function(o) {
			var cn = getNodeTree(this.data[0].element.parentNode);
			for (var i in cn) {
				var s = o == i || (o.name && o.name == i);
				if (s && typeof(o) == "string") { o = cn[i].o; }
				cn[i].style.margin = s ? "3px" : "4px";
				cn[i].style.border = s ? "1px solid #990000" : "";
				cn[i].style.backgroundColor = s ? "#CCDDFF" : "";
			}
			this.ob.doCallback(this.view,this,
				copyObject(this,{
					selected:o.name,
					e:null,
					action:"selected"					
				}
			));
		};
		return d;
	};	
	
	this.createIcon = function(o, view, parent) {
		if (parent.selectable) {
			o.parent = parent;
		}
		if (o.data.href) {
			var a = dg("",null,"a",{
				href:o.data.href,
				target:o.data.target?o.data.target:""
			});
		} else {
			var a = null;
		}
		var d = dg("",a,"div",{
			className:"lgIcon",
			style:{
				backgroundImage:"url("+parent.path + o.data.img + ".png)",
				margin:"4px",
				width:"32px",
				height:"32px",
				cursor:"pointer",
				cssFloat:"left"
			},
			title:o.data.title
		});
		this.registerEvents(d,view,o);
		return a?a:d;
	};
	
	this.createInput = function(o, view) {
		var d = dg("",null,"input",{
			onchange:function(e) {
				if (this.o.bind) {
					this.view[this.o.bind] = this.value;
				}
			},
			value:o.value?o.value:""
		});
		d.o = o;
		d.view = view;
		return d;
	};
	
	
	this.createButton = function(o,view) {
		var d = dc("input");
		d.type = "button";
		d.value = o.value;
		d.o = o;
		d.view = view;
		d.ob = this;
		d.onclick = function(e) {
			this.ob.doCallback(this.view,this.o,
				copyObject(this.o,{
					e:e,
					action:this.o.action
				}
			));
		};
		return d;
	};
	
	this.createUrl = function(o) {
		var d = dc('a');
		d.href = o.main ? o.main : o.data;
		d.innerHTML = o.data;
		if (o.target) { d.target = o.target; }
		return d;
	};
	
	this.createAnchor = function (layout,d) {
		var dd = dg("", d, "a", {
			name:layout.data.cleanLink()
		}, true);
	};
	
	this.clearBoth = function (layout,d) {
		var dd = dg("", d, "div", {
			style:{clear:"both"}
		});
	};
	
	this.createAnch = function (o) {
		return dg("", null, "a", {
			name:o.data.cleanLink()
		}, true);
	};
	
	this.createJump = function(o) {
		var d = dc('a');
		d.href = (o.href?o.href:"")+"#"+(o.main ? o.main : o.data).cleanLink();
		d.innerHTML = o.data;
		return d;
	};
	
	this.createWiki = function(o) {
		var d = dc('a');
		d.href = "http://en.wikipedia.org/wiki/" + (o.main ? o.main : o.data);
		d.innerHTML = o.data;
		d.target = "_blank";
		return d;
	};
	
	this.createYoutube = function(o) {
		var d = dc('iframe');
		d.src = "http://www.youtube.com/embed/" + o.data + "/";
		d.width = o.width ? o.width : 640;
		d.height = o.height ? o.height : 390;
		d.frameBorder = "0";
		d.allowfullscreen = true;
		return d;
	};
		
	this.createExample = function(o) {
		var d = dc("span");
		d.innerHTML = "<b>"+o.data+"</b> &nbsp; <a href=\""+o.data+"\" target=\"_BLANK\">TRY</a> &nbsp; <a href=\"?viewsource="+o.data+"\" target=\"_BLANK\">VIEW SOURCE</a>";
		
		return d;
	};
	
	this.createTab = function(o) {
		var d = dc("span"); 
		d.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;".repeat(o.tabs?o.tabs:1);
		return d;
	};
	
	this.createCodedefine = function(o) {
		var d = dc("div");
		d.className = "codedefine";
		d.innerHTML = o.lang ? this.geshi.highlight(o) : o.data.text2HTML();
		return d;
	};
	
	this.createCode = function(o) {
		var d = dc("div");
		d.className = "code";
		d.innerHTML = o.lang ? this.geshi.highlight(o) : o.data.text2HTML();
		return d;
	};
		
	// Layout	
	this.parseTagTranslateParams = function(a,layout,notTop) {

		var rv = {};
		for (var i in a) {
			if (typeof(a[i]) == "object") {
				rv[i] = this.parseTagTranslateParams(a[i],layout,true);
			} else if (a[i].substr(0,1) == "!") {
				var t = a[i].substr(1).split("+");
				var extra = t.length>1?t.pop():"";
				if (layout[t[0]] !== undefined) { rv[i] = layout[t[0]]+extra; }
			} else {
				rv[i] = a[i];
			}
		}
		
		if (!notTop) {
			for (var i in layout) {
				if (this.paramTranslate[i]) {
					setDeepRef(rv,this.paramTranslate[i],layout[i]);
				}
			}
		}
		return rv;	
	};
	
	this.parseLayout = function(element, layout, view, parent) {
		var i;
		for (i = 0; i < layout.length; i ++) {
			
			if (typeof(layout[i]) == "string") {
				layout[i] = {t:layout[i],data:""};
				var n = "none";
			} else {
				var n = layout[i].t;
				var n = "create" + n.charAt(0).toUpperCase() + n.substr(1);
			}
			
			if (typeof(this[n]) == "function") {
				var d = this[n](layout[i], view, parent);
				element.appendChild(d);
			} else {
				
				if (this.tagTranslate[layout[i].t]) {
					var d = dg('',element,this.tagTranslate[layout[i].t].t ? this.tagTranslate[layout[i].t].t : 'div',this.parseTagTranslateParams(this.tagTranslate[layout[i].t].a,layout[i]));
				} else {
					var d = dg('',element,'div');
				}
			}
			
			if (layout[i].name) {
				d.name = layout[i].name;
			}
			
			if ((","+this.hasRelatedClass+",").indexOf(","+layout[i].t+",") !== -1) { d.className = layout[i].t; }
							
			if (typeOf(layout[i].data) == "array") {
				this.parseLayout(d, layout[i].data, view, layout[i]);
			} else if (typeOf(layout[i].data) == "string") {
				setInnerHTML(d,this.formatText(layout[i].t, layout[i].data.trim()));
			}

			if (this.layoutFunction[layout[i].t]) {
				this[this.layoutFunction[layout[i].t]](layout[i],d);
			}
		}
		if (!parent) {
			dg("",element,"div",{style:{clear:"both"}});
		}
		return {type:"view",view:view,element:element,getElement:this.getElement};
	};
	
	this.getElement = function(ref) {
		var t = getNodeTree(this.view.parentElement);
		for (var i in t) {
			if (i == ref) {
				return t[i];
			}
		}
		return null;
	};
	
	this.formatText = function(type, text) {
		switch (type) {
			case "code":
			break;
		}
		return text;		
	};
	
	// Source parser
	this.parseLayoutFromSource = function(element, source) {
		this.parseLayout(element, this.sourceToLayout(source.wikify()));
	};
	
	this.sourceToLayout = function(source,notTop) {
		var o = new Array();
		var lastPos = 0, pos = 0, nextPos = -1;
	
		while ((pos = source.regexIndexOf(/(\[[a-zA-z0-9]+)/, pos)) != -1) {
			
			if (pos>lastPos) {
				o.push({t:"text",data:source.substr(lastPos,pos-lastPos).text2HTML()});
			}
			
			var tag = source.substr(pos + 1, (nextPos = source.indexOf("]",pos)) - pos - 1);
			nextPos++;
			
			var tmp = tag.splitParams();
			var params = {};
			for (var i = 0; i < tmp.length; i++) {
				var a = tmp[i].split("=",2);
				if (a.length > 1) { params[i?a[0]:"main"] = a[1]; }
				if (i == 0) { tmp[i] = a[0]; }				
			}
			var tag = tmp.shift();
			var endTag = "[/"+tag+"]";
			
			if (source.indexOf(endTag,nextPos+1) == -1) {
				o.push({t:tag,data:""});
				pos = nextPos; // There is no closing tag
			} else {
				//find end tag pos
				pos = this.findEndTagPos(source,pos,tag);				
				var inner = source.substr(nextPos, pos - nextPos).replace(/^\n|\n$/g,"");

				params.t = tag;
				params.data = (","+this.dontParseInner+",").indexOf(","+tag+",") !== -1 ? inner : this.sourceToLayout(inner,true);
				o.push(params);
				pos += endTag.length;
				if (source.substr(pos,1) == "\n" && (","+this.noBrAfter+",").indexOf(","+tag+",") !== -1) {
					pos++;
				}
			}
			lastPos = pos;
		}
		if (pos == -1) { pos = source.length; };
		
		if (pos>lastPos && (o.length || !notTop)) {
			o.push({t:"text",data:source.substr(lastPos,pos-lastPos).text2HTML()});
		}
		return o.length ? o : source;
	};
	
	this.findEndTagPos = function(source,pos,tag) {
		var retPos = pos;
		var level = 0, i = 0;
		while (1) {
			var begPos = source.indexOf("["+tag,pos); begPos = begPos === -1 ? 1000000 : begPos;
			var endPos = source.indexOf("[/"+tag+"]",pos); endPos = endPos === -1 ? 1000000 : endPos;
			
			if (begPos == 1000000 && endPos == 1000000) {
				return pos;
			} else if (begPos < endPos) {
				level ++; pos = source.indexOf("]", begPos + 1) + 1;
			} else {
				level --;
				pos = endPos;
				if (level == 0) {
					return pos;
				}
				pos += tag.length + 3;
			}
			i++; if (i > 100) return pos;
		}
	};
	
	if (o) {
		this.setOptions(o);
	}
};
