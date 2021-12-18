import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import { ImportValues } from './import-values';



export class IamNestedStack extends cdk.Construct {
  public masterRole: iam.Role;
  public builderSlaveRole: iam.Role;
  public deployerSlaveRole: iam.Role;

  constructor(scope: cdk.Construct, get: ImportValues) {
    super(scope, 'IAM');
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
    this.masterRole = new iam.Role(this, 'MasterRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      inlinePolicies: { accessFileSystemPolicy, manageSlavesPolicy },
    });


    this.builderSlaveRole = new iam.Role(this, 'BuilderSlaveRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, 'S3Access', 'arn:aws:iam::aws:policy/AmazonS3FullAccess'),
      ]
    });

    this.deployerSlaveRole = new iam.Role(this, 'DeployerSlaveRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(this, 'AdministratorAccess', 'arn:aws:iam::aws:policy/AdministratorAccess'),
      ]
    });

  }
}
