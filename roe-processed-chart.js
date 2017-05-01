
var svg, margin, width, height, x, y, xAxis, yAxis, valueline, valueline2, legend, element, dataset;

function drawROEProcessedChart( _element, _dataset ){

	element = _element;
	dataset = _dataset;

	//define the chart size and margins
	margin = {top: 10, //(parseInt(d3.select(element).style('width'), 10)/10), 
				right: 80, //(parseInt(d3.select(element).style('width'), 10)/20), 
				bottom: 25, //(parseInt(d3.select(element).style('width'), 10)/5), 
				left: 30 }; //(parseInt(d3.select(element).style('width'), 10)/20)},

	width = parseInt(d3.select(element).style('width'), 10) - margin.left - margin.right;
	height = parseInt(d3.select(element).style('height'), 10) - margin.top - margin.bottom;


	// define the axis
	x = d3.scale.ordinal().rangeRoundBands([0, width], .3);
	y = d3.scale.linear().range([height, 0]);

	//define the colors
	var color = colores; 

	xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(d3.format("0s"));

	// draw the axis
	svg = d3.select(element)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	x.domain(dataset.map(function(d) { return d.payperiod; }));
	y.domain([0, d3.max(dataset, function(d) { return d.total; })]);

	svg.append("g")         
        .attr("class", "grid")
        .call(make_y_axis(y)
            .tickSize(-width, 0, 0)
            .tickFormat("")
        )

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("ROEs processed per pay period");




	// draw the bars
	svg.selectAll(".bar")
		.data(dataset)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("width", x.rangeBand())
		.attr("x", function(d) { return x(d.payperiod); })
		.attr("y", function(d) { return y(d.total); })
		.attr("value", function(d){return d.payperiod;})
		.attr("height", function(d) { return height - y(d.total); })
		.style('fill', function(d,i){ return color(0); })
		.style('stroke', function(d,i){ return color(0); })
		.on("mouseover", function(d) { 
			console.log(d);     
            tt.transition()        
                .duration(200)      
                .style("opacity", .9);      
            tt.html("<b>" + d.payperiod + "</b><br/>Total ROEs: " + d.total + "<br/>Rejected ROEs: "  + d.rejected + "<br/>Failed ROEs: "  + d.failed)  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            tt.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });


	// draw the line
	valueline = d3.svg.line()
		.x(function(d) { return x(d.payperiod) + x.rangeBand()/2;})
		.y(function(d) { return y(d.rejected); });

	svg.append("path")
		.attr("class", "line")
		.attr("d", valueline(dataset))
		.style('stroke', function(d,i){ return color(1); });

	//draw the line dots
	svg.selectAll(".line-point")
		.data(dataset)
		.enter().append('circle')
		.attr("class", "line-point")
		.attr("cx", function(d) { return x(d.payperiod) + x.rangeBand()/2; })
		.attr("cy", function(d) { return y(d.rejected); })
		.attr("r", 3.5)
		.style("fill",  function(d,i){ return color(0); })
		.style('stroke', function(d,i){ return color(1); });


	// draw the line
	valueline2 = d3.svg.line()
		.x(function(d) { return x(d.payperiod) + x.rangeBand()/2;})
		.y(function(d) { return y(d.failed); });

	svg.append("path")
		.attr("class", "line2")
		.attr("d", valueline2(dataset))
		.style('stroke', function(d,i){ return color(2); });

	//draw the line dots
	svg.selectAll(".line-point2")
		.data(dataset)
		.enter().append('circle')
		.attr("class", "line-point2")
		.attr("cx", function(d) { return x(d.payperiod) + x.rangeBand()/2; })
		.attr("cy", function(d) { return y(d.failed); })
		.attr("r", 2.5)
		.style("fill",  function(d,i){ return color(0); })
		.style('stroke', function(d,i){ return color(2); });


	//draw the legend
	legend = svg.selectAll(".legend")
		.data(["Total","Rejected","Failed"])
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(70," + i * 23 + ")"; });

	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style('fill', function(d,i){ return color(i); })
		.style('stroke', function(d,i){ return color(i); });

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 8)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d){return d;});

	var tt = d3.select(element).append("div")   
		.attr("class", "chart-tooltip")               
		.style("opacity", 0.0);


	d3.select(window).on('resize', function resize() {
	    width = parseInt(d3.select(element).style('width'), 10) - margin.left - margin.right;
	    
	    /* Update the range of the scale with new width/height */
	    x = d3.scale.ordinal().rangeRoundBands([0, width], .3);
	    xAxis = d3.svg.axis().scale(x);
	    xAxis.ticks(Math.max(width/50, 2));

	    x.domain(dataset.map(function(d) { return d.payperiod; }));

	    /* Update the axis with the new scale */
	    svg.select(".x.axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

		svg.selectAll(".grid")     
        	.call(make_y_axis(y).tickSize(-width, 0, 0).tickFormat(""));

		svg.selectAll(".bar")
			.attr("width", x.rangeBand())
			.attr("x", function(d) { return x(d.payperiod); });

	    svg.selectAll('.line').attr("d", valueline(dataset));

		svg.selectAll(".line-point")
			.attr("cx", function(d) { return x(d.payperiod) + x.rangeBand()/2; });

		svg.selectAll(".line-point2")
			.attr("cx", function(d) { return x(d.payperiod) + x.rangeBand()/2; });


	    svg.selectAll('.line2').attr("d", valueline2(dataset));
	    legend.selectAll('text').attr("x", width - 24);
	    legend.selectAll('rect').attr("x", width - 18);
	});

}

function colores(n) {
  var colores_g = ["#444444", "#ff6666", "#bbbb66"];
  return colores_g[n % colores_g.length];
}

function make_x_axis(x) {        
    return d3.svg.axis()
        .scale(x)
         .orient("bottom")
         .ticks(5)
}

function make_y_axis(y) {        
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
}

