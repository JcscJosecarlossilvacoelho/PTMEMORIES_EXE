module.exports = {
 packagerConfig: {
    icon: "/Users/josecoelho/www/PTMEMEMORIES/KioskeExe/iconsPath/" // no file extension required
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
      arch:['x32']
    },
  ],
};
