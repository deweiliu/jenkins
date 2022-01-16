import { Construct } from 'constructs';
import {
  aws_ec2 as ec2,
  aws_route53 as route53,
  aws_certificatemanager as acm,
  aws_elasticloadbalancingv2 as elb,
  Duration,
} from 'aws-cdk-lib';

import { EcsNestedStack } from './ecs';
import { ImportValues } from './import-values';

export class AlbNestedStack extends Construct {
  public cname: route53.CnameRecord;

  constructor(scope: Construct, id: string, ecsResources: EcsNestedStack, get: ImportValues) {
    super(scope, id);

    get.clusterSecurityGroup.connections.allowFrom(get.albSecurityGroup, ec2.Port.tcp(get.hostPort), `Allow traffic from ELB for ${get.appName}`);

    const albTargetGroup = new elb.ApplicationTargetGroup(this, id + 'TargetGroup', {
      port: 80,
      protocol: elb.ApplicationProtocol.HTTP,
      vpc: get.vpc,
      targetType: elb.TargetType.INSTANCE,
      targets: [ecsResources.service],
      healthCheck: {
        enabled: true,
        interval: Duration.minutes(1),
        path: '/login',
        healthyHttpCodes: '200',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 10,
      },
    });

    new elb.ApplicationListenerRule(this, id + "ListenerRule", {
      listener: get.albListener,
      priority: get.priority,
      targetGroups: [albTargetGroup],
      conditions: [elb.ListenerCondition.hostHeaders([get.dnsName])],
    });

    const certificate = new acm.Certificate(this, id + 'SSL', {
      domainName: get.dnsName,
      validation: acm.CertificateValidation.fromDns(get.hostedZone),
    });
    get.albListener.addCertificates('AddCertificate', [certificate]);

    this.cname = new route53.CnameRecord(this, id + "AliasRecord", {
      zone: get.hostedZone,
      domainName: get.alb.loadBalancerDnsName,
      recordName: get.dnsRecord,
      ttl: Duration.hours(1),
    });

  }
}
