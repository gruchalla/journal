
(function(element) {
    require(['d3'], function(d3) {

        data = JSON.parse(argList[1]);

        var width = 1200;
        var height = 600;
        var margin = 0;
        var scale = 1000;

        data.forEach(function(d) {
            d.Date = d3.timeParse("%m/%d/%y")(d.Date);
        });
        
        //
        // Scales
        //
        var x = d3.scaleTime().range([margin, width-margin])
            .domain([d3.min(data, function(d) { return d.Date;}), new Date()]);
//            .domain(d3.extent(data, function(d) { return d.Date; }));


        var y = d3.scaleLinear().range([margin, height-margin])
            .domain(d3.extent(data, function(d) { return d.Cases; }));

        
        // 
        // SVG
        //
        var svg = d3.select(element).append("svg")                              
            .attr("width", width)                                               
            .attr("height", height);

        var cases = d3.area()
            .x(function(d) { return x(d.Date) })
            .y0(height)
            .y1(function(d) { return height-y(d.Cases) })

        var hosp = d3.area()
            .x(function(d) { return x(d.Date) })
            .y0(height)
            .y1(function(d) { return height-y(d.Hospitalizations) })

        var deaths = d3.area()
            .x(function(d) { return x(d.Date) })
            .y0(height)
            .y1(function(d) { return height-y(d.Deaths) })

        var p = svg.append("path")
            .datum(data)
            .attr("fill", "steelblue")
            .attr("d", cases);
        
        var p = svg.append("path")
            .datum(data)
            .attr("fill", "darkred")
            .attr("d", hosp);

        var p = svg.append("path")
            .datum(data)
            .attr("fill", "black")
            .attr("d", deaths);

        console.log("foobar");
        cleanUp();

    })
})(element);

