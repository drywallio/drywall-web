module.exports = {
  options: {
    use: [
      require('normalize')
    ],
    import: [
      'nib'
    ]
  },
  source: {
    options: {
      compress: false
    },
    files: {
      '<%= source %>/styles/app.css':
      '<%= source %>/styles/app.styl'
    }
  },
  staging: {
    options: {
      compress: true
    },
    files: {
      '<%= staging %>/styles/app.css':
      '<%= staging %>/styles/app.styl'
    }
  }
};
