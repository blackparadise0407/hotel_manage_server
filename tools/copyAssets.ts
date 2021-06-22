import * as shell from 'shelljs';

// shell.cp('-R', 'src/views', 'dist/');

shell.mkdir('-p', 'dist/.ssh');
shell.cp('-R', 'src/.ssh/*', 'dist/.ssh');
