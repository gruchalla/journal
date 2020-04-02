
(function(element) {
    require(['d3'], function(d3) {

        function compute_moving_averages(data, window) {
            var result={}
            var avg = data.map(function(d, i) {
                var si = Math.max(0,i-window);
                var ei = i;

                d["C_avg"] = d3.sum(data.slice(si,ei), function(x) { return x.C_delta; })/window;
                d["H_avg"] = d3.sum(data.slice(si,ei), function(x) { return x.H_delta; })/window;
                d["D_avg"] = d3.sum(data.slice(si,ei), function(x) { return x.D_delta; })/window;
            })
        }

        var margin = {top: 50, right: 50, bottom: 50, left: 50}
        var width = 1200 - margin.left - margin.right;
        var height = 600;
        var scale = 1000;
        var window = 5;

        data = JSON.parse(argList[1]);

        compute_moving_averages(data, 5);
        
        data.forEach(function(d) {
            d.Date = d3.timeParse("%m/%d/%y")(d.Date);
        });

        var maxDate = data[1].Date;
        data.forEach(function(d) {
            if (d.Cases) {
                maxDate = d.Date
            }
        });

        data = data.filter(function(d) { return d.Date <= maxDate; });
        
        //
        // Scales
        //
        var x0 = d3.scaleBand()
            .rangeRound([margin.left, width])
            .domain(data.map(function(d) { return d.Date; }));
        var x1 = d3.scaleBand()
            .domain(["C","H","D"])
            .rangeRound([0,x0.bandwidth()])
            .padding(0.15);
        var x = d3.scaleLinear()
            .range(d3.extent(data, function(d) { return x0(d.Date) + x0.bandwidth()/2; }))
            .domain(d3.extent(data, function(d) { return d.Date; }));

        var dy = d3.scaleLinear().range([height, margin.bottom])
            .domain([0, d3.max(data, function(d) { return 1.1 * d3.max([d.C_delta, d.H_delta, d.D_delta]); })]);;

        // gridlines function
        function make_y_gridlines() {		
            return d3.axisLeft(dy)
        }

        // 
        // SVG
        //
        var svg = d3.select(element).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
            .attr("x", width/2)
            .attr("y", margin.bottom-10)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text("Colorado COVID-19 Deltas (Cases, Hospitalizations, and Deaths)");


        var slice = svg.selectAll(".slice")
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform",function(d) { return "translate(" + x0(d.Date) + ",0)"; });

        slice.append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", x1("C"))
            .style("fill", "steelblue")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .attr("y", function(d) { return dy(d.C_delta); })
            .attr("height", function(d) { return dy(0) - dy(d.C_delta); });
        slice.append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", x1("H"))
            .style("fill", "darkred")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .attr("y", function(d) { return dy(d.H_delta); })
            .attr("height", function(d) { return dy(0) - dy(d.H_delta); });
        slice.append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", x1("D"))
            .style("fill", "darkgray")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .attr("y", function(d) { return dy(d.D_delta); })
            .attr("height", function(d) { return dy(0) - dy(d.D_delta); });

        
        svg.append("path")
            .datum(data)
            .attr("class", "outline")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Date); })
                  .y(function(d) { return dy(d.C_avg); }));
        svg.append("path")
            .datum(data)
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Date); })
                  .y(function(d) { return dy(d.C_avg); }));

        svg.append("path")
            .datum(data)
            .attr("class", "outline")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Date); })
                  .y(function(d) { return dy(d.H_avg); }));
        svg.append("path")
            .datum(data)
            .attr("stroke", "darkred")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Date); })
                  .y(function(d) { return dy(d.H_avg); }));

        svg.append("path")
            .datum(data)
            .attr("class", "outline")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Date); })
                  .y(function(d) { return dy(d.D_avg); }));
        svg.append("path")
            .datum(data)
            .attr("stroke", "darkgray")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Date); })
                  .y(function(d) { return dy(d.D_avg); }));


        // Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0)
                  .tickFormat(d3.timeFormat("%m/%d")));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate( " + width + ", 0 )")
            .call(d3.axisRight(dy));

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(dy));

        // y gridlines
        svg.append("g")			
            .attr("class", "grid")
            .call(make_y_gridlines()
                  .tickSize(-width)
                  .tickFormat(""));
        // Legend 
        svg.append("rect")
            .attr("x", x.range()[0]-30)
            .attr("y", dy.range()[1]+10)
            .attr("width", 125)
            .attr("height", 95)
            .style("fill", "#606060")
            .style("stroke", "lightgray");

        svg.append("rect")
            .attr("x", x.range()[0]-20)
            .attr("y", dy.range()[1]+20)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "steelblue");
       svg.append("text")
            .attr("x", x.range()[0])
            .attr("y", dy.range()[1]+32)
            .attr("fill", "white")
            .style("text-anchor", "start")
            .style("font-size", 12)
            .text("Known Cases");

        svg.append("rect")
            .attr("x", x.range()[0]-20)
            .attr("y", dy.range()[1]+40)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "darkred");
        svg.append("text")
            .attr("x", x.range()[0])
            .attr("y", dy.range()[1]+52)
            .attr("fill", "white")
            .style("text-anchor", "start")
            .style("font-size", 12)
            .text("Hospitalizations");

        svg.append("rect")
            .attr("x", x.range()[0]-20)
            .attr("y", dy.range()[1]+60)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "darkgray");
        svg.append("text")
            .attr("x", x.range()[0])
            .attr("y", dy.range()[1]+72)
            .attr("fill", "white")
            .style("text-anchor", "start")
            .style("font-size", 12)
            .text("Deaths");

        svg.append("rect")
            .attr("x", x.range()[0]-20)
            .attr("y", dy.range()[1]+87)
            .attr("width", 15)
            .attr("height", 2)
            .style("fill", "white")
            .style("stroke", "black");
        svg.append("text")
            .attr("x", x.range()[0])
            .attr("y", dy.range()[1]+92)
            .attr("fill", "white")
            .style("text-anchor", "start")
            .style("font-size", 12)
            .text(window + " Day Average");

/*
        // Tooltips
        var div = d3.select(element).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("top", 500);
        
        svg.on("touchmove mousemove", function() {
            var mx = d3.mouse(this)[0];
            var my = d3.mouse(this)[1];
            
            if (mx > x.range()[0] && mx < x.range()[1] &&
                my > y.range()[1] && my < y.range()[0]) {
                
                const bisect = d3.bisector(d => d.Date).left;
                var index = bisect(data, x.invert(d3.mouse(this)[0]), 1);
                d = data[index];

                var html='<span style="margin-left: 2.5px;"><b>' + d.Date.toDateString() + '</b><br></span>' +
                    '<table style="margin-top: 2.5px;">' +
                        '<tr><td>Cases: </td><td style="text-align: right">' + d.Cases + '</td></tr>' +
                        '<tr><td>Hospitalizations: </td><td style="text-align: right">' + d.Hospitalizations + '</td></tr>' +
                        '<tr><td>Deaths: </td><td style="text-align: right">' + d.Deaths + '</td></tr>' +
                        '<tr><td>Hospitalized/Cases: </td><td style="text-align: right">' + d3.format(".2f")(100*d.Hospitalizations/d.Cases) + '%</td></tr>' +
                        '<tr><td>Deaths/Cases: </td><td style="text-align: right">' + d3.format(".2f")(100*d.Deaths/d.Cases) + '%</td></tr>' +
                        '<tr><td>Deaths/Hospitalized: </td><td style="text-align: right">' + d3.format(".2f")(100*d.Deaths/d.Hospitalizations) + '%</td></tr>' +
                      '</table>'

                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(html)
                    .style("top", my + "px")
                    .style("left", mx+140 + "px");
            }
            else {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
                div.html(html)
                    .style("top", my + "px")
                    .style("left", mx+140 + "px");
            }
        });
  */      
        cleanUp();
    })
})(element);

