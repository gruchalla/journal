
(function(element) {
    require(['d3'], function(d3) {

        data = JSON.parse(argList[1]);


        var margin = {top: 50, right: 50, bottom: 50, left: 50}
        var width = 1200 - margin.left - margin.right;
        var height = 600;
        var scale = 1000;

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
        var x = d3.scaleTime().range([margin.left, width])
            .domain([d3.min(data, function(d) { return d.Date;}), maxDate]);

        var y = d3.scaleLinear().range([height, margin.bottom])
            .domain(d3.extent(data, function(d) { return d.Cases; }));

        //var y = d3.scaleLog().range([height, 0])
        //    .domain([1, d3.max(data, function(d) { return d.Cases; })]);

        // gridlines function
        function make_y_gridlines() {		
            return d3.axisLeft(y)
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
            .text("Colorado COVID-19 Cases, Hospitalizations, and Deaths");
        
        var cases = d3.area()
            .x(function(d) { return x(d.Date) })
            .y0(y.range()[0])
            .y1(function(d) { return y(d.Cases) })

        var hosp = d3.area()
            .x(function(d) { return x(d.Date) })
            .y0(y.range()[0])
            .y1(function(d) { return y(d.Hospitalizations) })

        var deaths = d3.area()
            .x(function(d) { return x(d.Date) })
            .y0(y.range()[0])
            .y1(function(d) { return y(d.Deaths) })

        svg.append("path")
            //.datum(data.filter(function(d) { return d.Cases > 0; }))
            .datum(data)
            .attr("stroke", "white")
            .attr("fill", "steelblue")
            .attr("d", cases);
        
        svg.append("path")
            //.datum(data.filter(function(d) { return d.Hospitalizations > 0; }))
            .datum(data)
            .attr("stroke", "white")
            .attr("fill", "darkred")
            .attr("d", hosp);

        svg.append("path")
            //.datum(data.filter(function(d) { return d.Deaths > 0; }))
            .datum(data)
            .attr("stroke", "white")
            .attr("fill", "darkgray")
            .attr("d", deaths);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                  .tickFormat(d3.timeFormat("%m/%d")));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate( " + width + ", 0 )")
            .call(d3.axisRight(y));

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

        // y gridlines
        svg.append("g")			
            .attr("class", "grid")
            .call(make_y_gridlines()
                  .tickSize(-width)
                  .tickFormat(""));

        // Legend 
        svg.append("rect")
            .attr("x", x.range()[0]-30)
            .attr("y", y.range()[1]+10)
            .attr("width", 125)
            .attr("height", 75)
            .style("fill", "#606060")
            .style("stroke", "lightgray");

        svg.append("rect")
            .attr("x", x.range()[0]-20)
            .attr("y", y.range()[1]+20)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "steelblue");
       svg.append("text")
            .attr("x", x.range()[0])
            .attr("y", y.range()[1]+32)
            .attr("fill", "white")
            .style("text-anchor", "start")
            .style("font-size", 12)
            .text("Known Cases");

        svg.append("rect")
            .attr("x", x.range()[0]-20)
            .attr("y", y.range()[1]+40)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "darkred");
        svg.append("text")
            .attr("x", x.range()[0])
            .attr("y", y.range()[1]+52)
            .attr("fill", "white")
            .style("text-anchor", "start")
            .style("font-size", 12)
            .text("Hospitalizations");

        svg.append("rect")
            .attr("x", x.range()[0]-20)
            .attr("y", y.range()[1]+60)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", "darkgray");
        svg.append("text")
            .attr("x", x.range()[0])
            .attr("y", y.range()[1]+72)
            .attr("fill", "white")
            .style("text-anchor", "start")
            .style("font-size", 12)
            .text("Deaths");

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
        
        cleanUp();
    })
})(element);

