/*
 Kudos to openly posted content/examples (that this is based on)
 - http://bl.ocks.org/mbostock/4063530
*/
(function () {
  function circle_type(d) {
    var c = d.children ? "node" : "leaf node"
    if (!d.children) {
      if (d.coverage >= 90) c += " leaf-ok"
      else if (d.coverage === 0) c += " leaf-nocov"
      else if (d.coverage >= 60) c += " leaf-warn"
      else c += " leaf-bad"
    }
    return c
  }

  function node_radius(d) { return d.r }
  function node_size(d) { return d.size }

  function translate_2d(d) {
    return "translate(" + d.x + 2 + "," + d.y + ")"
  }

  function node_text(d) {
    return d.name + "<br/>" +
           d.loc + " lines (of code)<br/>" +
           parseInt(d.coverage, 10) + "% covered<br/>"
  }

  function draw(opts) {
    d3.json(opts.data_url, function(error, root) {
      var
        pack = d3.layout.pack()
                 .size([opts.diameter - 4, opts.diameter - 4])
                 .value(node_size),
        svg = d3.select(opts.parent_node)
                      .append("svg")
                      .attr("width", opts.diameter)
                      .attr("height", opts.diameter)
                      .append("g")
                      .attr("transform", "translate(2,2)"),
        node = svg.datum(root)
                    .selectAll(".node")
                    .data(pack.nodes)
                    .enter()
                    .append("g")
                    .attr("class", circle_type)
                    .attr("transform", translate_2d)

      node.append("text").html(node_text)
      node.append("circle").attr("r", node_radius)

      $(opts.parent_node)
        .find('circle')
        .on('mouseover', function () {
          $(opts.parent_node)
            .find('.details')
            .html($(this).parent().find('text').html())
        })
    })

    $(opts.parent_node)
      .append($('<div>')
                .addClass('details')
                .text('hover over a circle to see details'))
  }

  xtag.register('x-cov-graph', {
    extends: 'div',
    methods: {
      draw: function () {
        draw({
          parent_node: this,
          data_url: this.getAttribute('data'),
          diameter: this.getAttribute('diameter')
        })
      }
    }
  })
}())
