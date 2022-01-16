
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';

import { AlbNestedStack } from './alb';
import { IamNestedStack } from './iam';
import { NetworkingNestedStack } from './networking';

export class ExportValues extends Construct {


    constructor(scope: Construct, id: string,
        iamResources: IamNestedStack, albResources: AlbNestedStack, networkingResources: NetworkingNestedStack
    ) {
        super(scope, id);
        new CfnOutput(this, 'DnsName', { value: albResources.cname.domainName });
        new CfnOutput(this, 'SlaveSecurityGroup', { value: networkingResources.slaveSecurityGroup.securityGroupId });
        new CfnOutput(this, 'SlaveBuilderInstanceProfile', { value: iamResources.builderSlaveInstanceProfile.attrArn });
        new CfnOutput(this, 'SlaveDeployerInstanceProfile', { value: iamResources.deployerSlaveInstanceProfile.attrArn });
    }

}