import ActiveCommand from './ActiveCommand';
import FollowAgeCommand from './FollowAgeCommand';
import AddCmdCommand from './AddCmdCommand';
import DelCmdCommand from './DelCmdCommand';
import UptimeCommand from './UptimeCommand';

// Exports
export default [
  new ActiveCommand(),
  new FollowAgeCommand(),
  new AddCmdCommand(),
  new DelCmdCommand(),
  new UptimeCommand()
];