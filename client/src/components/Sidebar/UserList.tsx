import Avatar from '@shared/Avatar';
import {Link} from 'react-router-dom';
import {IUser} from 'types/UserInterfaces';

const  UserList = ({user}:{user:IUser}) => {
  return (
    <div className="w-full  flex flex-1 items-center justify-start flex-wrap gap-3">
      <Avatar alt="User avatar" src={user.avatar} radius="sm" />
      <Link to={user._id ? `profile` : `user/${user._id}`} className="text-gray-900  text-left ">
        {user.username}
      </Link>
    </div>);
}

export default UserList;