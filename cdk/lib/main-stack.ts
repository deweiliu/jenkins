import * as cdk from '@aws-cdk/core';
import { ImportValues } from './import-values';
import { IamNestedStack } from './iam';
import { EfsNestedStack } from './efs';
import { EcsNestedStack } from './ecs';
import { AlbNestedStack } from './alb';

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

    const iamResources = new IamNestedStack(this, 'Iam', get);
    const efsResources = new EfsNestedStack(this, 'Efs', get);
    const ecsResources = new EcsNestedStack(this, 'Ecs', iamResources, efsResources, get);
    const albResources = new AlbNestedStack(this, 'Alb', ecsResources, get);

    new cdk.CfnOutput(this, 'DnsName', { value: albResources.cname.domainName });
  }
}
