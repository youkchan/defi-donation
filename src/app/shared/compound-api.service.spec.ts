import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DataStorageService } from './data-storage.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ProjectService } from '../projects/project.service';
import { defer } from 'rxjs';
import { Project } from '../projects/project.model';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { CompoundAPIService } from './compound-api.service';

function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

describe('CompoundAPIService', () => {
  let httpClientSpy;
  let compoundAPIService: CompoundAPIService;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    compoundAPIService = new CompoundAPIService(httpClientSpy as any);
  });

  it('getSupplyRate', (done) => {
    const expectedProjects: {cToken: {symbol: string, supply_rate: {value: string}}[]} = {
      cToken: [
        {symbol: 'cUSDC', supply_rate: {value: '0.01'}},
        {symbol: 'cDai', supply_rate: {value: '0.02'}},
      ]
    };

    httpClientSpy.get.and.returnValue(asyncData(expectedProjects));
    compoundAPIService.getSupplyRate().subscribe(
      (response) => {
        expect(response).toEqual(+expectedProjects.cToken[0].supply_rate.value);
        done();
      }
    );
  });
});
