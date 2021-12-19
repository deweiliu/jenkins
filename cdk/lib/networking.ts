import { ImportValues } from './import-values';
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as efs from '@aws-cdk/aws-efs';

export class NetworkingNestedStack extends cdk.Construct {
    public slaveSecurityGroup: ec2.SecurityGroup;
    constructor(scope: cdk.Construct, id: string, get: ImportValues) {
        super(scope, id);
        get.slaveSubnets.forEach((subnet, index) => {
            const routeTable = new ec2.CfnRouteTable(this, id + 'RouteTable' + index, { vpcId: get.vpc.vpcId });

            new ec2.CfnSubnetRouteTableAssociation(this, id + 'Association' + index, {
                routeTableId: routeTable.ref,
                subnetId: subnet.subnetId,
            })
            new ec2.CfnRoute(this, id + 'PublicRouting' + index, {
                destinationCidrBlock: '0.0.0.0/0',
                routeTableId: routeTable.ref,
                gatewayId: get.igwId,
            });
        });

        this.slaveSecurityGroup = new ec2.SecurityGroup(this, id + 'SecurityGroup', {
            vpc: get.vpc,
            securityGroupName: 'SlavesSecurityGroup',
            description: 'Security group for Jenkins slaves',
        });
        this.slaveSecurityGroup.connections.allowFrom(get.clusterSecurityGroup, ec2.Port.tcp(22), 'Allow trafic from Jenkins master to Jenkins slaves');




    }
}