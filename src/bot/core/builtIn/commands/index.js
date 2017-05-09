import ActiveCommand from './ActiveCommand';
import FollowAgeCommand from './FollowAgeCommand';
import AddCmdCommand from './AddCmdCommand';
import DelCmdCommand from './DelCmdCommand';

// Exports
export default [
  new ActiveCommand(),
  new FollowAgeCommand(),
  new AddCmdCommand(),
  new DelCmdCommand()
];