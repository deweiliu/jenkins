import { Construct } from 'constructs';
import { aws_ecs as ecs, aws_logs as logs } from 'aws-cdk-lib';

import { EfsNestedStack } from './efs';
import { IamNestedStack } from './iam';
import { ImportValues } from './import-values';

export class EcsNestedStack extends Construct {
  public service: ecs.Ec2Service;
  constructor(scope: Construct, id: string, iamResources: IamNestedStack, efsResources: EfsNestedStack, get: ImportValues) {
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
      memoryReservationMiB: 1024,
      portMappings: [{ containerPort: 8080, hostPort: get.hostPort, protocol: ecs.Protocol.TCP }],
      logging: new ecs.AwsLogDriver({ streamPrefix: get.appName, logRetention: logs.RetentionDays.ONE_MONTH }),
    });
    container.addMountPoints(
      { containerPath: '/var/jenkins_home', readOnly: false, sourceVolume: 'jenkins-home' },
    );

    this.service = new ecs.Ec2Service(this, id + 'Service', {
      cluster: get.cluster,
      taskDefinition,
      desiredCount: get.instanceCount,
      minHealthyPercent: get.instanceCount > 1 ? 50 : 0,
      maxHealthyPercent: 200,
    });

  }
}
