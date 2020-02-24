import { ProjectService } from './project.service';
import { Project } from '../projects/project.model';

describe('ProjectService', () => {
  let projectService: ProjectService;
  const baseProjects: Project[] = [
    { address: 'XXXXXXXX', description: 'test2 description', name: 'test2'  },
    { address: 'YYYYYYYY', description: 'test description', name: 'test'  },
  ];

  beforeEach(() => {
    projectService = new ProjectService();
  });

  it('getProjects, setProjects', () => {
    projectService.setProjects(baseProjects);
    expect(baseProjects).toEqual(projectService.getProjects());
  });

  it('addProject', () => {
    projectService.setProjects(baseProjects);
    const addProject = new Project('test3', 'test3 description', 'AAAAAAAA');
    projectService.addProject(addProject);
    baseProjects.push({ address: 'AAAAAAAA', description: 'test3 description', name: 'test3' });
    expect(baseProjects).toEqual(projectService.getProjects());
  });

});
