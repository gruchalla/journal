
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
        var x = d3.scaleLog()
            .range([margin.left, width])
            .domain([1, d3.max(data, function(d) { return d3.max([10000, d.Cases, d.Hospitalizations, d.Deaths]); })]);

        var dy = d3.scaleLog().range([height, margin.bottom])
            .domain([1, d3.max(data, function(d) { return d3.max([1000, d.C_delta, d.H_delta, d.D_delta]); })]);

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
            .text("Colorado COVID-19 Trajectories (Cases, Hospitalizations, and Deaths)");
        
        svg.append("path")
            .datum(data.filter(function(d) { return d.C_avg >= 1; }))
            .attr("class", "outline")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Cases); })
                  .y(function(d) { return dy(d.C_avg); }));
        svg.append("path")
            .datum(data.filter(function(d) { return d.C_avg >= 1; }))
            .attr("stroke", "steelblue")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Cases); })
                  .y(function(d) { return dy(d.C_avg); }));

        svg.append("path")
            .datum(data.filter(function(d) { return d.H_avg >= 1; }))
            .attr("class", "outline")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Hospitalizations); })
                  .y(function(d) { return dy(d.H_avg); }));
        svg.append("path")
            .datum(data.filter(function(d) { return d.H_avg >= 1; }))
            .attr("stroke", "darkred")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Hospitalizations); })
                  .y(function(d) { return dy(d.H_avg); }));

        svg.append("path")
            .datum(data.filter(function(d) { return d.D_avg >= 1; }))
            .attr("class", "outline")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Deaths); })
                  .y(function(d) { return dy(d.D_avg); }));
        svg.append("path")
            .datum(data.filter(function(d) { return d.D_avg >= 1; }))
            .attr("stroke", "darkgray")
            .attr("stroke-width", "2px")
            .attr("fill", "none")
            .attr("d", d3.line()
                  .x(function(d) { return x(d.Deaths); })
                  .y(function(d) { return dy(d.D_avg); }));


        // Axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

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

        cleanUp();
    })
})(element);

