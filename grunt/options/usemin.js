module.exports = {
  options: {
    dirs: ['<%= staging %>']
  },
  templates: {
    options: {
      type: 'html',
      assetsDirs: ['<%= staging %>']
    },
    files: [{
      src: ['<%= staging %>/templates/**/*.html']
    }]
  },
  css: {
    options: {
      assetsDirs: [
        '<%= staging %>/styles',
        '<%= staging %>'
      ]
    },
    files: [{
      src: ['<%= staging %>/styles/app.css']
    }]
  },
  html: ['<%= staging %>/index.html']
};
