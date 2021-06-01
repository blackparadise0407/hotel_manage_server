import * as shell from 'shelljs';

// shell.cp('-R', 'src/views', 'dist/');

shell.mkdir('-p', 'dist/public/uploads/video');
shell.mkdir('-p', 'dist/public/uploads/image');