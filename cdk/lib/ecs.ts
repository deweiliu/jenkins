import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { ImportValues } from './import-values';
import * as route53 from '@aws-cdk/aws-route53';
import * as ec2 from '@aws-cdk/aws-ec2';

import * as ecs from '@aws-cdk/aws-ecs';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import { EfsNestedStack } from './efs';


export class EcsNestedStack extends cdk.Construct {

  constructor(scope: cdk.Construct, efsResources: EfsNestedStack, get: ImportValues) {
    super(scope, 'ECS');
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', {
      networkMode: ecs.NetworkMode.BRIDGE,
      volumes: [{
        name: 'jenkins-home', efsVolumeConfiguration: {
          fileSystemId: get.fsId,
          transitEncryption: 'ENABLED',
          authorizationConfig: { accessPointId: efsResources.accessPoint.accessPointId, iam: 'ENABLED' },
        }
      }],
    });

    taskDefinition.addToTaskRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['elasticfilesystem:ClientMount', 'elasticfilesystem:ClientWrite'],
      resources: [get.fsArn],
    }));

    const container = taskDefinition.addContainer('Container', {
      image: ecs.ContainerImage.fromRegistry(get.dockerImage),
      containerName: `${get.appName}-container`,
      memoryReservationMiB: 200,
      portMappings: [{ containerPort: 8080, hostPort: get.hostPort, protocol: ecs.Protocol.TCP }],
      logging: new ecs.AwsLogDriver({ streamPrefix: get.appName }),
    });
    container.addMountPoints(
      { containerPath: '/var/jenkins_home', readOnly: false, sourceVolume: 'jenkins-home' },
    );

    const service = new ecs.Ec2Service(this, 'Service', {
      cluster: get.cluster,
      taskDefinition,
      desiredCount: 1,
    });

    // Load balancer configuration
    get.clusterSecurityGroup.connections.allowFrom(get.albSecurityGroup, ec2.Port.tcp(get.hostPort), `Allow traffic from ELB for ${get.appName}`);

    const albTargetGroup = new elb.ApplicationTargetGroup(this, 'TargetGroup', {
      port: 80,
      protocol: elb.ApplicationProtocol.HTTP,
      vpc: get.vpc,
      targetType: elb.TargetType.INSTANCE,
      targets: [service],
      healthCheck: {
        enabled: true,
        interval: cdk.Duration.minutes(1),
        path: '/login',
        healthyHttpCodes: '200',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
      },
    });

    new elb.ApplicationListenerRule(this, "ListenerRule", {
      listener: get.albListener,
      priority: get.priority,
      targetGroups: [albTargetGroup],
      conditions: [elb.ListenerCondition.hostHeaders([get.dnsName])],
    });

    const certificate = new acm.Certificate(this, 'SSL', {
      domainName: get.dnsName,
      validation: acm.CertificateValidation.fromDns(get.hostedZone),
    });
    get.albListener.addCertificates('AddCertificate', [certificate]);

    const record = new route53.CnameRecord(this, "AliasRecord", {
      zone: get.hostedZone,
      domainName: get.alb.loadBalancerDnsName,
      recordName: get.dnsRecord,
      ttl: cdk.Duration.hours(1),
    });

    new cdk.CfnOutput(this, 'DnsName', { value: record.domainName });
  }
}
