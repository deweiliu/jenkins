import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { ImportValues } from './import-values';



export class IamNestedStack extends cdk.Construct {
  public masterRole: iam.Role;
  public builderSlaveRole: iam.Role;
  public deployerSlaveRole: iam.Role;
  public masterInstanceProfile: iam.CfnInstanceProfile;
  public builderSlaveInstanceProfile: iam.CfnInstanceProfile;
  public deployerSlaveInstanceProfile: iam.CfnInstanceProfile;

  constructor(scope: cdk.Construct, id: string, get: ImportValues) {
    super(scope, id);
    const manageSlavesPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ec2:DescribeSpotInstanceRequests',
            'ec2:CancelSpotInstanceRequests',
            'ec2:GetConsoleOutput',
            'ec2:RequestSpotInstances',
            'ec2:RunInstances',
            'ec2:StartInstances',
            'ec2:StopInstances',
            'ec2:TerminateInstances',
            'ec2:CreateTags',
            'ec2:DeleteTags',
            'ec2:DescribeInstances',
            'ec2:DescribeKeyPairs',
            'ec2:DescribeRegions',
            'ec2:DescribeImages',
            'ec2:DescribeAvailabilityZones',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSubnets',
            'iam:ListInstanceProfilesForRole',
            'iam:PassRole',
            'ec2:GetPasswordData',
          ],
          resources: ['*']
        }),
      ]
    });
    const accessFileSystemPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['elasticfilesystem:ClientMount', 'elasticfilesystem:ClientWrite'],
          resources: [get.fsArn]
        }),
      ]
    });
    this.masterRole = new iam.Role(this, id + 'MasterRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      inlinePolicies: { accessFileSystemPolicy, manageSlavesPolicy },
    });



    this.builderSlaveRole = new iam.Role(this, id + 'BuilderSlaveRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, id + 'S3Access', 'arn:aws:iam::aws:policy/AmazonS3FullAccess'),
      ]
    });
    this.builderSlaveInstanceProfile = new iam.CfnInstanceProfile(this, id + 'BuilderSlaveInstanceProfile', {
      instanceProfileName: 'jenkins-builder-slave',
      roles: [this.builderSlaveRole.roleName],
    });

    this.deployerSlaveRole = new iam.Role(this, id + 'DeployerSlaveRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, id + 'AdministratorAccess', 'arn:aws:iam::aws:policy/AdministratorAccess'),
      ]
    });
    this.deployerSlaveInstanceProfile = new iam.CfnInstanceProfile(this, id + 'DeployerSlaveInstanceProfile', {
      instanceProfileName: 'jenkins-deployer-slave',
      roles: [this.deployerSlaveRole.roleName],
    });

  }
}
