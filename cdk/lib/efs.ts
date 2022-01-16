import { Construct } from 'constructs';
import {
    aws_ec2 as ec2,
    aws_efs as efs,
    Stack,
} from 'aws-cdk-lib';

import { ImportValues } from './import-values';

export class EfsNestedStack extends Construct {
    public accessPoint: efs.AccessPoint;

    constructor(scope: Construct, id: string, get: ImportValues) {
        super(scope, 'Efs');
        const fsSecurityGroup = new ec2.SecurityGroup(this, id + 'EfsSecurityGroup', { vpc: get.vpc });
        fsSecurityGroup.connections.allowFrom(get.clusterSecurityGroup, ec2.Port.tcp(2049), `Allow traffic from ${get.appName} to the File System`);

        const subnets: ec2.ISubnet[] = [];
        [...Array(get.maxAzs).keys()].forEach(azIndex => {
            const subnet = new ec2.PublicSubnet(this, id + 'Subnet' + azIndex, {
                vpcId: get.vpc.vpcId,
                availabilityZone: Stack.of(this).availabilityZones[azIndex],
                cidrBlock: `10.0.${get.appId}.${(azIndex + 2) * 16}/28`,
                mapPublicIpOnLaunch: true,
            });
            new ec2.CfnRoute(this, id + 'PublicRouting' + azIndex, {
                destinationCidrBlock: '0.0.0.0/0',
                routeTableId: subnet.routeTable.routeTableId,
                gatewayId: get.igwId,
            });
            subnets.push(subnet);

            new efs.CfnMountTarget(this, id + 'MountTarget' + azIndex, {
                fileSystemId: get.fsId,
                securityGroups: [fsSecurityGroup.securityGroupId],
                subnetId: subnet.subnetId
            });
        });

        const fileSystem = efs.FileSystem.fromFileSystemAttributes(this, id + 'FileSystem', {
            securityGroup: fsSecurityGroup,
            fileSystemId: get.fsId,
        });

        const posixId = '1000';
        this.accessPoint = new efs.AccessPoint(this, id + 'AccessPoint', {
            fileSystem,
            createAcl: { ownerGid: posixId, ownerUid: posixId, permissions: "755" },
            path: '/jenkins-home',
            posixUser: { uid: posixId, gid: posixId },
        });

    }
}