import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import { ImportValues } from './import-values';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { Duration } from '@aws-cdk/core';
import { AccessPoint, CfnMountTarget, FileSystem } from '@aws-cdk/aws-efs';
import { ISubnet, PublicSubnet } from '@aws-cdk/aws-ec2';

export interface CdkStackProps extends cdk.StackProps {
  maxAzs: number;
  appId: number;
  domain: string;
  dnsRecord: string;
  appName: string;
}
export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const get = new ImportValues(this, props);

    // EFS configuration
    const fsSecurityGroup = new ec2.SecurityGroup(this, 'FsSecurityGroup', { vpc: get.vpc });
    fsSecurityGroup.connections.allowFrom(get.clusterSecurityGroup, ec2.Port.tcp(2049), `Allow traffic from ${get.appName} to the File System`);

    const subnets: ISubnet[] = [];
    [...Array(props.maxAzs).keys()].forEach(azIndex => {
      const subnet = new PublicSubnet(this, `Subnet` + azIndex, {
        vpcId: get.vpc.vpcId,
        availabilityZone: cdk.Stack.of(this).availabilityZones[azIndex],
        cidrBlock: `10.0.${get.appId}.${(azIndex + 2) * 16}/28`,
        mapPublicIpOnLaunch: true,
      });
      new ec2.CfnRoute(this, 'PublicRouting' + azIndex, {
        destinationCidrBlock: '0.0.0.0/0',
        routeTableId: subnet.routeTable.routeTableId,
        gatewayId: get.igwId,
      });
      subnets.push(subnet);

      new CfnMountTarget(this, 'MountTarget' + azIndex, {
        fileSystemId: get.fsId,
        securityGroups: [fsSecurityGroup.securityGroupId],
        subnetId: subnet.subnetId
      });
    });

    const fileSystem = FileSystem.fromFileSystemAttributes(this, 'FileSystem', {
      securityGroup: fsSecurityGroup,
      fileSystemId: get.fsId,
    });

    const posixId = '1000';
    const accessPoint = new AccessPoint(this, 'AccessPoint', {
      fileSystem,
      createAcl: { ownerGid: posixId, ownerUid: posixId, permissions: "755" },
      path: '/jenkins-home',
      posixUser: { uid: posixId, gid: posixId },
    });


    // ECS resources
    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', {
      networkMode: ecs.NetworkMode.BRIDGE,
      volumes: [{
        name: 'jenkins-home', efsVolumeConfiguration: {
          fileSystemId: get.fsId,
          transitEncryption: 'ENABLED',
          authorizationConfig: { accessPointId: accessPoint.accessPointId, iam: 'ENABLED' },
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
        interval: Duration.minutes(1),
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
      ttl: Duration.hours(1),
    });

    new cdk.CfnOutput(this, 'DnsName', { value: record.domainName });
  }
}
