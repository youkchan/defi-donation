import { ProjectService } from './project.service';
import { Project } from '../projects/project.model';
import { UserProjectService } from './user-project.service';
import { UserProject } from './user-project.model';

describe('UserProjectService', () => {
  let userProjectService: UserProjectService;
  const baseProjects: UserProject[] = [
      { userAddress: 'XXXXXXXX', amount: 10 , projectAddress: 'YYYYYYYYY', id: 'key1', delFlg: 0  },
      { userAddress: 'XXXXXXXX', amount: 5 , projectAddress: 'ZZZZZZZZZ', id: 'key2', delFlg: 0  },
  ];

  beforeEach(() => {
    userProjectService = new UserProjectService();
  });

  it('getUserProjects, setUserProjects', () => {
    userProjectService.setUserProjects(baseProjects);
    expect(baseProjects).toEqual(userProjectService.getUserProjects());
  });

  it('addUserProject', () => {
    userProjectService.setUserProjects(baseProjects);
    const addProject: UserProject =  { userAddress: 'AAAAAAAA', amount: 1 , projectAddress: 'BBBBBBBB', id: 'key3', delFlg: 0  };
    userProjectService.addUserProject(addProject);
    baseProjects.push(addProject);
    expect(baseProjects).toEqual(userProjectService.getUserProjects());
  });

  it('deleteUserProject', () => {
    userProjectService.setUserProjects(baseProjects);
    userProjectService.deleteUserProject('key1');
    baseProjects.splice(0, 1);
    expect(baseProjects).toEqual(userProjectService.getUserProjects());
  });



});
