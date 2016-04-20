/*
	script.js
	hierachical bars
*/

	console.log("script.js")
	
	var minHeight = height;
	var x4_axis_grid;
	var	barHeight = 30;
	var duration = 750;
	var delay = 25;
	var color = d3.scale.ordinal().range(["steelblue", "#ccc"]);
	var xAxis4;
	var svg4;
	var x4;
	var selectedBar = '';

	function draw_HierarchicalBars(data){
		
		graphic4.empty();
		
		minHeight = height;		
		x4 = d3.scale.linear().range([0, chart_width]);
		xAxis4 = d3.svg.axis().scale(x4).orient('top');
		partition = d3.layout.partition().value(function(d) { return d.size; });	
		
		svg4 = d3.select("#graphic4").append("svg")
			.attr("class","mySVG")
			.attr("id","svg4")
			.attr("width", function(d,i){
				if (graphic.width() < threshold_sm) { return chart_width + 75 + 25; }
				else if (graphic.width() < threshold_md) { return chart_width + 75 + 50; }
				else { return chart_width + 75 + 100; }		
			})
			.attr("height", 450 )
			.append("g")
				.attr("transform", function(d,i){					
				
					if (graphic.width() < threshold_sm) { return "translate(" + (75) + "," + 50 + ")"; }
					else if (graphic.width() < threshold_md) { return "translate(" + (75) + "," + 50 + ")"; }
					else { return "translate(" + (75) + "," + 50 + ")"; }
				});
					
						
		// svg text labels ... 
		svg4.append("text")
			.attr("class" , "info")
			.attr("id" , "nameInfo")
			.attr("x" , margin.left)
			.attr("y" , -25)
			.style("text-anchor" , "middle")
			.style("stroke", "none")
			.style("fill", "#0d78a7")
			.style("font-weight", "bold")
			.style("font-size", "14px")
			.text("LABEL");					
					  
		svg4.append("rect")
			.attr("class", "background")
			.attr("id", "background")
			.attr("width", chart_width)
			.attr("height", height)
			.on("mouseover",function(d,i){
				var ele = this.id;				
				infoHide();
				showTooltip(ele,d,"background")
			})
			.on("mouseout",function(d,i){ removeTooltip(); })
			.on("click", up);

		svg4.append("g")
			.attr("class", "x axis")
			.attr("id", "xAxis4");

		//gridlines
		x4_axis_grid = function() { return xAxis4; }	
		
		svg4.append('g')
			.attr('class', 'x grid')
			.attr('id', 'x4grid')
			.style('pointer-events', 'none')
			.call(x4_axis_grid()
				.tickSize(-height, 0, 0)					
			);
		
		var root = {};
		var rootArray = [];
		
		for ( var element in data.data.WORKINGHOURAGE_DATA ){
			
			var fleetDataArrayObj = {};
			var fleetDataArray = [];

			for ( var i in data.data.FLEET_DATA[element] ){			
				
				var singleFleet = {};
				singleFleet = { "name":i , "size":data.data.FLEET_DATA[element][i].size };
				fleetDataArray.push(singleFleet);
			}
			
			fleetDataArrayObj = { "name":element , "children" : fleetDataArray };			
			rootArray.push(fleetDataArrayObj)
			
		}// end for ... 
		
		root = { "name" : "results" , "children" : rootArray };		
		
		


//		if ( move == "onload" ) {	
		
//			d3.json("readme.json", function(error, root) {
			
//				if (error) throw error;					

		getDepth = function (obj) {
			var depth = 0;
			if (obj.children) {
				obj.children.forEach(function (d) {
					var tmpDepth = getDepth(d)

					if (tmpDepth > depth) {
						depth = tmpDepth
					}
				})
			}
			return 1 + depth
		}
		
		maxDepth = getDepth(root) - 1;			
		partition.nodes(root);
		x4.domain([0, root.value]).nice();

		d3.select("#nameInfo").text("Level " + (root.depth+1) + " of " + maxDepth);

		down(root, 0);
//			});			
//		}
/*
		else {				
			partition.nodes(this_D);
			x.domain([0, this_D.value]).nice();		

			d3.select("#nameInfo").text("Level " + (this_D.depth+1) + " of " + maxDepth);
	
			down(this_D, this_I);
			
		}// end else ...
*/		
		

		
		
		
		/*
			name: function down(d, i)
		*/
		function down(d, i) {
		
			this_D = d;
			this_I = i;
			
			if ( d.children ) {
						
				var newHeight = (d.children.length*barHeight*1.2)+margin.top+15;
				
				if ( newHeight < minHeight ) { newHeight = minHeight; }
				else {  newHeight = newHeight; }	
				
				d3.select("#svg4").attr("height", newHeight)
				d3.select("#x4grid").call(x4_axis_grid().tickSize(-newHeight, 0, 0));
										
				FDS.sortOption = "value";
				d3.selectAll(".btn").attr("class" , "btn btn-primary-outline default")
				d3.select("#value").attr("class" , "btn btn-primary-outline active")
								
				if (!d.children || this.__transition__) return;
				var end = duration + d.children.length * delay;
						
				// Mark any currently-displayed bars as exiting.
				var exit = svg4.selectAll(".enter").attr("class", "exit");
							  
				d3.select("#x4grid").remove();
				
				// Entering nodes immediately obscure the clicked-on bar, so hide it.
				exit.selectAll("rect")
					.filter(function(p) { return p === d; })
					.style("fill-opacity", 1e-6);
				  
				// Enter the new bars for the clicked-on data.
				// Per above, entering bars are immediately visible.
				var enter = bar(d)
					.attr("transform", stack(i))
					.style("opacity", 1);

				// Have the text fade-in, even though the bars are visible.
				// Color the bars as parents; they will fade to children if appropriate.
				enter.select("text").style("fill-opacity", 1e-6);
				enter.select("rect").style("fill", color(true));

				// Update the x-scale domain.
				x4.domain([0, d3.max(d.children, function(d) { return d.value; })]).nice();

				// Update the x-axis.
				svg4.selectAll(".x.axis").transition()
					.duration(duration)
					.call(xAxis4);
					

				// Transition entering bars to their new position.
				var enterTransition = enter.transition()
					.duration(duration)
					.delay(function(d, i) { return i * delay; })
					.attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; });

				// Transition entering text.
				enterTransition.select("text").style("fill-opacity", 1);

				// Transition entering rects to the new x-scale.
				enterTransition.select("rect")
					.attr("width", function(d) { return x4(d.value); })
					.style("fill", function(d) { return color(!!d.children); });

				// Transition exiting bars to fade out.
				var exitTransition = exit.transition()
					.duration(duration)
					.style("opacity", 1e-6)
					.remove();

				// Transition exiting bars to the new x-scale.
				exitTransition.selectAll("rect").attr("width", function(d) { return x4(d.value); });

				// Rebind the current node to the background.
				svg4.select(".background")
					.datum(d)
					.transition()
					.duration(end);

				d.index = i;
				
				return;
				
			}// end if ...
			
			else {
			
			}
		
		}	// end function down()


		
		

		
		
		
		/*
		name: function up(d)
		*/
		function up(d,i) {
			
			d3.select("#nameInfo").text("Level " + (d.parent.depth+1) + " of " + maxDepth);			
		
			var newHeight = (d.parent.children.length*barHeight*1.2)+margin.top+15;
			
			if ( newHeight < minHeight ) { newHeight = minHeight; }
			else {  newHeight = newHeight; }	
			
			d3.select("#svg4").attr("height", newHeight)
			d3.select("#x4grid").call(x4_axis_grid().tickSize(-newHeight, 0, 0));	

			FDS.sortOption = "value";
			d3.selectAll(".btn").attr("class" , "btn btn-primary-outline default")
			d3.select("#value").attr("class" , "btn btn-primary-outline active")
			
			showTooltip("background", d , 'background');
					
			if (!d.parent || this.__transition__) return;
			var end = duration + d.children.length * delay;

			// Mark any currently-displayed bars as exiting.
			var exit = svg4.selectAll(".enter").attr("class", "exit");

			// Enter the new bars for the clicked-on data's parent.
			var enter = bar(d.parent)
				.attr("transform", function(d, i) { return "translate(0," + barHeight * i * 1.2 + ")"; })
				.style("opacity", 1e-6);

			// Color the bars as appropriate.
			// Exiting nodes will obscure the parent bar, so hide it.
			enter.select("rect")
				.style("fill", function(d) { return color(!!d.children); })
				.filter(function(p) { return p === d; })
				.style("fill-opacity", 1e-6);

			// Update the x-scale domain.
			x4.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

			// Update the x-axis.
			svg4.selectAll(".x.axis").transition()
				.duration(duration)
				.call(xAxis4);

			// Transition entering bars to fade in over the full duration.
			var enterTransition = enter.transition()
				.duration(end)
				.style("opacity", 1);

			// Transition entering rects to the new x-scale.
			// When the entering parent rect is done, make it visible!
			enterTransition.select("rect")
				.attr("width", function(d) { return x4(d.value); })
				.each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

			// Transition exiting bars to the parent's position.
			var exitTransition = exit.selectAll("g").transition()
				.duration(duration)
				.delay(function(d, i) { return i * delay; })
				.attr("transform", stack(d.index));

			// Transition exiting text to fade out.
			exitTransition.select("text")
				.style("fill-opacity", 1e-6);

			// Transition exiting rects to the new scale and fade to parent color.
			exitTransition.select("rect")
				.attr("width", function(d) { return x4(d.value); })
				.style("fill", color(true));

			// Remove exiting nodes when the last child has finished transitioning.
			exit.transition()
				.duration(end)
				.remove();

			// Rebind the current parent to the background.
			svg4.select(".background")
				.datum(d.parent)
				.transition()
				.duration(end);
				
			return;
							
		}// end function up(d)
		
		

		

		// Creates a set of bars for the given data node, at the specified index.
		function bar(d) {
		
			var bar = svg4.insert("g", ".y.axis")
				.attr("class", "enter")
				.attr("transform", "translate(0,5)")
				.selectAll("g")
				.data(d.children)
				.enter()
				.append("g")
					.attr("class", "groups")
					.attr("id", function(d,i){ return "group" + i; })
					.style("cursor", function(d) { return !d.children ? null : "pointer"; });

			bar.append("text")
				.attr("class", "yAxisLabels")
				.attr("id", function(d,i){ return "yAxisLabel" + i; })
				.attr("x", -15)
				.attr("y", barHeight / 2)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) { return d.name; })
				.on("mouseover" , function(d,i){
						infoHide();
						var ele = this;
						d3.selectAll(".yAxisLabels").style("font-size","10px").style("font-weight","normal").style("fill", "#222222");
						d3.select("#"+this.id).style("font-size","16px").attr("dy", ".35em").style("font-weight","bold").style("fill", "#bed630");
						return;
				})
				.on("mouseout" , function(d,i){
						var ele = this;
											
						if ( selectedBar == '' ) {
							d3.select("#"+this.id).style("font-size","10px").style("font-weight","normal").style("fill", "#222222");
						}
						
						if ( selectedBar != '' && d.name != selectedBar.name ) {
							d3.select("#"+this.id).style("font-size","10px").style("font-weight","normal").style("fill", "#222222");
							d3.select("#yAxisLabel"+selectedBar.id).style("font-size","16px").style("font-weight","bold").style("fill", "#bed630");								
						}
						
						return;
				})
				.on("click", function(d,i){
										
					if( d.name == selectedBar.name ) {
					
						d3.select("#dataBar"+i)
							.style("opacity" , .75)
							.style("fill" , function(){
								if (typeof d.children !== 'undefined') {																				
									selectedBar = '';
									return "#4682B4";
								}
								else {										
									selectedBar = '';
									return "#ccc";
								}
						})
						return;
					}
					else {
					
						d3.selectAll(".dataBars")
							.style("opacity" , .75)
							.style("fill" , function(d,i){
								if (typeof d.children !== 'undefined') { return "#4682B4"; }
								else{ return "#ccc"; }
						})
						
						d3.select("#dataBar"+i).style("opacity" , 0.95).style("fill" , "#bed630");
						d3.select("#intBar"+i).style("opacity" , 0.00);
						
						selectedBar = d;
						selectedBar.id = i;
						return;
					}
				});

			bar.append("rect")
				.attr("class", function(d,i) { return "dataBars"; })
				.attr("id", function(d,i) { return "dataBar"+i; })
				.attr("width", function(d) { return x4(d.value); })
				.attr("height", barHeight);
				
			bar.append("rect")
				.attr("class", function(d,i) { return "SLABreachBars"; })
				.attr("id", function(d,i) { return "SLABreachBar"+i; })
				.attr("width", function(d) { return 5; })
				.attr("x", function(d) { return -7; })
				.attr("height", barHeight)
				.style("fill" , "red")
				.style("display" , function(d,i){
					if ( d.name >= 9 ) { return "inline"; }
					else { return "none"; }
				});			
						  
			bar.append("rect")
				.attr("class", function(d,i) { return "intBars"; })
				.attr("id", function(d,i) { return "intBar"+i; })
				.attr("width", function(d) { return 0 + (x4(x4.domain()[1])) })
				.attr("height", barHeight)
				.style("fill", "#ccc")
				.style("opacity", "0.0")
				.on("mouseover", function(d,i){
					infoHide();
				
					selectedBar = '';
				
					var  ele = this.id;
					d3.select("#"+ele).style("opacity" , 0.33)
					var dataBar = ele.replace("int","data")
					d3.select("#"+dataBar).style("opacity" , 0.95).style("fill" , "#fdbb30")
					showTooltip(ele, d , 'graphic1');
				})
				.on("mouseout", function(d,i){
					var  ele = this.id;
					d3.select("#"+ele).style("opacity" , 0.0)
					var dataBar = ele.replace("int","data")

					d3.select("#"+dataBar)
					.style("opacity" , .75)
					.style("fill" , function(){
						if (typeof d.children !== 'undefined') { return "#4682B4"; }
						else{ return "#ccc"; }
					})
					
					removeTooltip();
				})
				.on("click", function(d,i){
				
					if ( d.children ) {
					
						d3.select("#nameInfo").text("Level " + (d.depth+1) + " of " + maxDepth);
												
						this_D = d;
						this_I = i;
					
						down(d,i);
						
					}
					
					else {
						d3.select("#nameInfo").text("Level " + (d.depth) + " of " + maxDepth + " - No further childen");
					}
				});

			return bar;
		  
		}// end function bar(d)

		// A stateful closure for stacking bars horizontally.
		function stack(i) {
			
			var x0 = 0;
			return function(d) {			
				var tx = "translate(" + x0 + "," + barHeight * i * 1.2 + ")";
				x0 += x4(d.value);				
				return tx;
			};
		}
		

		
		
  

		
			
		
		
		/*
			NAME: 			showTooltip
			DESCRIPTION: 	function used to display D3 style tooltip. Show the tooltip on the hovered over circle instead of the Voronoi grid
			CALLED FROM:	transitionData
							drawGraphic
			CALLS:			n/a	
			REQUIRES: 		d - data item 
							fid - ID of selected dotsrc - where has function been called from/what kind of voronoi layer is being moused over (FULL or TEMP)
			RETURNS: 		n/a
		*/
		function showTooltip(fid , d , src) {

			var element;	
			element = d3.select("#" + fid);
			
			if( src == "background" && d.name == "results" ) {
				return;
			}			
			else if( src == "background" && d.name != "results" ) {
				childStr = "<b style='color:white'>Click to return up one level</b>";
			}
			else {
				//Save the circle element (so not the voronoi which is triggering the hover event)
				//in a variable by using the unique class of the voronoi (CountryCode)
				var element;		
				element = d3.select("#" + fid);
				
				var childStr = "\n";
				
				if (typeof d.children !== 'undefined') {			
					for(var i=0; i<d.children.length; i++) {
						childStr = childStr + "</br><b>" + d.children[i].name + " - </b>" + formatNumber(d.children[i].value);
					}
					
					childStr = "<span style='font-size: 14px; text-align: center;'>Statistics for: <b>" + d.name + " </b></br></br><b>Total value:</b> " + formatNumber(d.value) + " </br><b>Children:</b> " + (d.children.length) + "</br>" + childStr;
				}
				else {
					childStr = "<span style='font-size: 14px; text-align: center;'>Statistics for: <b>" + d.name + " </b></br></br><b>Total value:</b> " + formatNumber(d.value) + " </br><b>Children:</b> No children. </br>";
				}
			
			} // end else ... 
			
			//Show the tooltip over the "element" variable (the circle) instead of "this"
			$(element).popover({
					placement: 'auto top',
					container: 'body',
					id:"toolTip",
					trigger: 'manual',
					html : true,
					content: function() { return childStr; }
			});
			$(element).popover('show');

			return;
			
		}//end function showTooltip 		
		
		
		/*
			NAME: 			removeTooltip
			DESCRIPTION: 	function used to hide D3 style tooltip. Hide the tooltip when the mouse moves away
			CALLED FROM:	transitionData
							drawGraphic
			CALLS:			n/a	
			REQUIRES: 		n/a
			RETURNS: 		n/a
		*/
		function removeTooltip() {			
			$('.popover').each(function() { $(this).remove(); });
			return;

		}//end function removeTooltip 
		
			
				
		
			
				
				
		function formatNumber (num) {
			return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
		}	
		
		
		
		function compareNumbers(a, b) {
			return a.name - b.name;
		}function infoHide(){
		
			d3.select("#help").attr("class" , "btn btn-primary-outline default")
			$("#infoBox").hide(400);
		}		
		
		return;
		
	}// end function draw_HierarchicalBars()
		
		
		
			
			
			

