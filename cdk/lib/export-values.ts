
import * as cdk from '@aws-cdk/core';
import { AlbNestedStack } from './alb';
import { IamNestedStack } from './iam';
import { NetworkingNestedStack } from './networking';

export class ExportValues extends cdk.Construct {


    constructor(scope: cdk.Construct, id: string,
        iamResources: IamNestedStack, albResources: AlbNestedStack, networkingResources: NetworkingNestedStack
    ) {
        super(scope, id);
        new cdk.CfnOutput(this, 'DnsName', { value: albResources.cname.domainName });
        new cdk.CfnOutput(this, 'SlaveSecurityGroup', { value: networkingResources.slaveSecurityGroup.securityGroupId });
        new cdk.CfnOutput(this, 'SlaveBuilderInstanceProfile', { value: iamResources.builderSlaveInstanceProfile.attrArn });
        new cdk.CfnOutput(this, 'SlaveDeployerInstanceProfile', { value: iamResources.deployerSlaveInstanceProfile.attrArn });

    }


}