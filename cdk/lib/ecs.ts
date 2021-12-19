import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import { EfsNestedStack } from './efs';
import { IamNestedStack } from './iam';
import { ImportValues } from './import-values';

export class EcsNestedStack extends cdk.Construct {
  public service: ecs.Ec2Service;
  constructor(scope: cdk.Construct, id: string, iamResources: IamNestedStack, efsResources: EfsNestedStack, get: ImportValues) {
    super(scope, id);
    const taskDefinition = new ecs.Ec2TaskDefinition(this, id + 'TaskDefinition', {
      taskRole: iamResources.masterRole,
      networkMode: ecs.NetworkMode.BRIDGE,
      volumes: [{
        name: 'jenkins-home', efsVolumeConfiguration: {
          fileSystemId: get.fsId,
          transitEncryption: 'ENABLED',
          authorizationConfig: { accessPointId: efsResources.accessPoint.accessPointId, iam: 'ENABLED' },
        }
      }],
    });

    const container = taskDefinition.addContainer('Container', {
      image: ecs.ContainerImage.fromRegistry(get.dockerImage),
      containerName: `${get.appName}-container`,
      memoryReservationMiB: 640,
      portMappings: [{ containerPort: 8080, hostPort: get.hostPort, protocol: ecs.Protocol.TCP }],
      logging: new ecs.AwsLogDriver({ streamPrefix: get.appName }),
    });
    container.addMountPoints(
      { containerPath: '/var/jenkins_home', readOnly: false, sourceVolume: 'jenkins-home' },
    );

    this.service = new ecs.Ec2Service(this, id + 'Service', {
      cluster: get.cluster,
      taskDefinition,
      desiredCount: 1,
    });

  }
}
