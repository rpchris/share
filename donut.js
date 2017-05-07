
var ROEFailureChart = function(){

	this.draw=function(element, dataset){

		this.element = element;
		this.dataset = dataset;

		this.pie=d3.layout.pie()
			.value(function(d){return d.percent})
			.sort(null)
			.padAngle(.03);
		 
		this.margin = {top: 10, right: 10, bottom: 30, left: 10 };

		this.width = parseInt(d3.select(element).style('width'), 10) - this.margin.left - this.margin.right;
		this.height = parseInt(d3.select(element).style('height'), 10) - this.margin.top - this.margin.bottom;

		this.outerRadius=this.height/2;
		this.innerRadius=50;
		 
		 this.color = d3.scale.ordinal()
			//.domain(["0", "1", "2"])
			.range(["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"]);


		 
		this.arc=d3.svg.arc()
			.outerRadius(this.outerRadius)
			.innerRadius(this.innerRadius)
		 
		this.svg = d3.select(this.element)
				.append("svg")
				.attr("width", this.width + this.margin.left + this.margin.right)
				.attr("height", this.height + this.margin.top + this.margin.bottom)
				.append("g")
				.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");



		// filters go in defs element
		this.defs = this.svg.append("defs");

		// create filter with id #drop-shadow
		// height=130% so that the shadow is not clipped
		this.filter = this.defs.append("filter")
		    .attr("id", "drop-shadow")
		    .attr("height", "130%");

		// SourceAlpha refers to opacity of graphic that this filter will be applied to
		// convolve that with a Gaussian with standard deviation 3 and store result
		// in blur
		this.filter.append("feGaussianBlur")
		    .attr("in", "SourceAlpha")
		    .attr("stdDeviation", 3)
		    .attr("result", "blur");

		// translate output of Gaussian blur to the right and downwards with 2px
		// store result in offsetBlur
		this.filter.append("feOffset")
		    .attr("in", "blur")
		    .attr("dx", 3)
		    .attr("dy", 3)
		    .attr("result", "offsetBlur");

		// overlay original SourceGraphic over translated blurred opacity by using
		// feMerge filter. Order of specifying inputs is important!
		this.feMerge = this.filter.append("feMerge");

		this.feMerge.append("feMergeNode")
		    .attr("in", "offsetBlur")
		this.feMerge.append("feMergeNode")
		    .attr("in", "SourceGraphic")

		var grads = this.svg.append("defs").selectAll("radialGradient")
			.data(this.pie(this.dataset))
		    .enter().append("radialGradient")
		    .attr("gradientUnits", "userSpaceOnUse")
		    .attr("cx", 0)
		    .attr("cy", 0)
		    .attr("r", "100%")
		    .attr("id", function(d, i) { return "grad" + i; });
		//grads.append("start").attr("offset", "0%").style("start-color", function(d, i) { return this.color(i); }.bind(this));
		grads.append("stop").attr("offset", "0%").style("stop-color", "white");
		grads.append("stop").attr("offset", "10%").style("stop-color", function(d, i) { return this.color(i); }.bind(this));
		grads.append("stop").attr("offset", "90%").style("stop-color", "white");


		this.chart = this.svg.append('g')
			.attr({
				transform:'translate('+ (this.margin.left + this.height/2) +','+ (this.margin.top + this.height/2) +')'
			});

		this.path=this.chart.selectAll('path')
			.data(this.pie(this.dataset))
			.enter()
			.append('path')
			.style("filter", "url(#drop-shadow)")
			.attr("fill", function(d, i) { return "url(#grad" + i + ")"; })
    		.attr("d", this.arc);
    	


    	this.path.on("mouseover", function(d) {     
            this.tt.transition()        
                .duration(200)      
                .style("opacity", .6);      
            this.tt.html("<b>" + d.name + "</b>")  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            }.bind(this))                  
        .on("mouseout", function(d) {       
            this.tt.transition()        
                .duration(500)      
                .style("opacity", 0);   
        }.bind(this));

		 
		this.path.transition()
			.duration(500)
			.attrTween('d', function(d) {
				var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
				return function(t) {
					return this.arc(interpolate(t));
				}.bind(this)
			}.bind(this));
		 
		this.text=this.chart.selectAll('text')
			.data(this.pie(this.dataset))
			.enter()
			.append("text")
			.transition()
			.delay(function(d,i){return 3500 + i * 100})
			.duration(200)
			.attr("transform", function (d) {
				return "translate(" + this.arc.centroid(d) + ")";
			}.bind(this))
			.attr("dy", ".4em")
			.attr("text-anchor", "middle")
			.text(function(d){
				return d.data.percent+"%";
			})
			.style({
				fill:'#fff',
				opacity:0.7,
				'font-size':'10px'
			});

		//draw the legend
		this.legend2 = this.svg.selectAll(".legend2")
			.data(this.dataset)
			//.data(this.color.domain())
			.enter().append("g")
			.attr("class", "legend2")
			.attr("transform", function(d, i) { return "translate(0," + i * 23 + ")"; });

		this.legend2.append("rect")
			//.transition().delay(function(d,i){return 500 + i * 500})
			.attr("x", this.width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style('stroke', function(d, i) { return this.color(i); }.bind(this) )
			.style('fill', function(d, i) { return this.color(i); }.bind(this) );

		this.legend2.append("text").transition().delay(function(d,i){return 500 + i * 500})
			.duration(1000)
			.attr("x", this.width- 24)
			.style("max-width", 100)
			.attr("y", 8)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d){console.log(d); return d.name;});

		this.tt = d3.select("body").append("div")   
			.attr("class", "chart-tooltip")
			.style("opacity", 0.0);

		d3.select(window).on('resize', function resize() {
		    this.width = parseInt(d3.select(this.element).style('width'), 10) - this.margin.left - this.margin.right;
		    
		    this.legend2.selectAll('text').attr("x", this.width - 24);
		    this.legend2.selectAll('rect').attr("x", this.width - 18);
		}.bind(this));

	}
}
