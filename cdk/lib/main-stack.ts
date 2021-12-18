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
import { IamNestedStack } from './iam';
import { EfsNestedStack } from './efs';
import { EcsNestedStack } from './ecs';

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

    const iamResources = new IamNestedStack(this, get);
    const efsResources = new EfsNestedStack(this, get);

    const ecsResources = new EcsNestedStack(this, efsResources, get);


  }
}
