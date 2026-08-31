# Westos Platform - AWS Infrastructure
# Terraform configuration for EKS, RDS, ElastiCache, S3, CloudFront

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }

  backend "s3" {
    bucket = "westos-terraform-state"
    key    = "infrastructure/terraform.tfstate"
# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "westos-${var.environment}"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment == "dev"
  enable_dns_hostnames   = true
  enable_dns_support     = true
  enable_classiclink     = false
  assign_generated_ipv6_cidr_block = false

  tags = {
    Name = "westos-${var.environment}-vpc"
  }
}
    region = "ap-south-1"
    encrypt = true
# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "westos-${var.environment}"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_group_defaults = {
    ami_type       = "AL2_x86_64"
    instance_types = ["t3.medium"]
  }

  eks_managed_node_groups = {
    general = {
      name           = "general"
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"

      min_size     = var.environment == "prod" ? 3 : 1
      max_size     = var.environment == "prod" ? 10 : 3
      desired_size = var.environment == "prod" ? 5 : 2

      labels = {
        Environment = var.environment
        NodeGroup   = "general"
      }

      taints = []
    }

    compute = {
      name           = "compute"
      instance_types = ["t3.large", "t3.xlarge"]
      capacity_type  = "SPOT"

      min_size     = 0
      max_size     = var.environment == "prod" ? 5 : 2
      desired_size = 0

      labels = {
        Environment = var.environment
        NodeGroup   = "compute"
        Workload    = "batch"
      }

      taints = [
        {
          key    = "workload"
          value  = "batch"
          effect = "NO_SCHEDULE"
        }
      ]
    }
  }

  tags = {
    Environment = var.environment
  }
}
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "westos"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}