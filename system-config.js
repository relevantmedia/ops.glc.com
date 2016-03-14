System.config({
  packages: {
    app: {
      format: 'register',
      defaultExtension: 'js'
    }
  },
  // paths: {
  //   rxjs: 'dist/assets/js/modules/Rx.js',
  // }
});
System.import('app/boot')
      .then(null, console.error.bind(console));
