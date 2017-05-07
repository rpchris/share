
var svg, margin, width, height, x, y, xAxis, yAxis, valueline, valueline2, legend, element, dataset;

function drawROEProcessedChart( _element, _dataset ){

	element = _element;
	dataset = _dataset;

	//define the chart size and margins
	margin = {top: 10, right: 80, bottom: 25, left: 30 };

	width = parseInt(d3.select(element).style('width'), 10) - margin.left - margin.right;
	height = parseInt(d3.select(element).style('height'), 10) - margin.top - margin.bottom;

	var color = d3.scale.ordinal()
		.domain(["total", "rejected", "failed"])
		.range(["#e6ab02","#e7298a","#666666","#1b9e77"]);


	// define the axis
	x = d3.scale.ordinal().rangeRoundBands([0, width], .3);
	y = d3.scale.linear().range([height, 0]);

	//define the colors
	//var color = colores; 

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



// filters go in defs element
var defs = svg.append("defs");

// create filter with id #drop-shadow
// height=130% so that the shadow is not clipped
var filter = defs.append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "180%");

// SourceAlpha refers to opacity of graphic that this filter will be applied to
// convolve that with a Gaussian with standard deviation 3 and store result
// in blur
filter.append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 3)
    .attr("result", "blur");

// translate output of Gaussian blur to the right and downwards with 2px
// store result in offsetBlur
filter.append("feOffset")
    .attr("in", "blur")
    .attr("dx", 7)
    .attr("dy", 3)
    .attr("result", "offsetBlur");


// overlay original SourceGraphic over translated blurred opacity by using
// feMerge filter. Order of specifying inputs is important!
var feMerge = filter.append("feMerge");

feMerge.append("feMergeNode")
    .attr("in", "offsetBlur")
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");




//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");
//Vertical gradient
linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

//Set the color for the start (0%)
linearGradient.append("stop") 
    .attr("offset", "0%")   
    .attr("stop-color", "#7bcebb"); 

//Set the color for the end (100%)
linearGradient.append("stop") 
    .attr("offset", "100%")   
    .attr("stop-color", color(0)); 




	// draw the bars
	var bars =svg.selectAll(".bar")
		.data(dataset);


		bars.enter().append("rect")
		.attr("class", "bar")
		//.style('fill', function(d,i){ return color(0); })
		.style("fill", "url(#linear-gradient)")
		//.style('stroke', function(d,i){ return color(0); })
		.style("filter", "url(#drop-shadow)")
		.attr("width", x.rangeBand())
		.attr("x", function(d) { return x(d.payperiod); })
		.attr("y", function(d) { return height; })
		.attr("value", function(d){return d.payperiod;})
		.attr("height", 0)
		.transition().delay(function(d,i){return i * 100})
            .duration(400)
            .ease("exp")
            .attr("height", function(d) { return height - y(d.total); })
            .attr("y", function(d){return y(d.total);});
		


		bars.on("mouseover", function(d) { 
			console.log(d);     
            tt.transition()        
                .duration(200)      
                .style("opacity", .6);      
            tt.html("<b>" + d.payperiod + "</b><br/>Total ROEs: " + d.total + "<br/>Rejected ROEs: "  + d.rejected + "<br/>Failed ROEs: "  + d.failed)  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            tt.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });

	

	// draw the rejected line
	valueline = d3.svg.line()
	.interpolate("cardinal")  
		.x(function(d) { return x(d.payperiod) + x.rangeBand()/2;})
		.y(function(d) { return y(d.rejected); });

	svg.append("path")
		.attr("class", "line")
		.attr("d", valueline(dataset))
		.style('opacity', 0)
		.transition().delay(function(d,i){return 1500 + i * 100}).duration(1000)
			.style('opacity', 1)
			.style('stroke', function(d,i){ return color(1); });

	


	// draw the failed line
	valueline2 = d3.svg.line()
	.interpolate("cardinal")  
		.x(function(d) { return x(d.payperiod) + x.rangeBand()/2;})
		.y(function(d) { return y(d.failed); });

	svg.append("path")
		.attr("class", "line2")
		.attr("d", valueline2(dataset))
		.style('opacity', 0)
		.transition().delay(function(d,i){return 2000 + i * 100}).duration(1000)
			.style('opacity', 1)
			.style('stroke', function(d,i){ return color(2); });

	//draw the line dots
	svg.selectAll(".line-point")
		.data(dataset)
		.enter().append('circle') 
		.attr("class", "line-point")
		.attr("cx", function(d) { return x(d.payperiod) + x.rangeBand()/2; })
		.attr("cy", function(d) { return y(d.rejected); })
		.attr("r", 0)
		.style("fill",  function(d,i){ return color(0); })
		.style('stroke', function(d,i){ return color(1); })
		.transition().delay(function(d,i){return 1000 + i * 100})
            .duration(500)
            .ease("quad")
            .attr("r", 7.5)
        .transition()
            .duration(500)
            .ease("quad")
            .attr("r", 3.5);

	//draw the line dots
	svg.selectAll(".line-point2")
		.data(dataset)
		.enter().append('circle')
		.attr("class", "line-point2")
		.attr("cx", function(d) { return x(d.payperiod) + x.rangeBand()/2; })
		.attr("cy", function(d) { return y(d.failed); })
		.attr("r", 0)
		.style("fill",  function(d,i){ return color(0); })
		.style('stroke', function(d,i){ return color(2); })
		.transition().delay(function(d,i){return 1500 + i * 100})
            .duration(500)
            .ease("quad")
            .attr("r", 6.5)
        .transition()
            .duration(500)
            .ease("quad")
            .attr("r", 2.5);



	//draw the legend
	legend = svg.selectAll(".legend")
		.data(["Total","Rejected","Failed"])
		//.data(color.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(70," + i * 23 + ")"; });

	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		//.transition().delay(function(d,i){return 500 + i * 500})
		.style('fill', function(d,i){ return color(i); })
		.style('stroke', function(d,i){ return color(i); });

	legend.append("text").transition().delay(function(d,i){return 500 + i * 500})
		.duration(1000)
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

