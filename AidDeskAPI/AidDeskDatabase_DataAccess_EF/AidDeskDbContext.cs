using System;
using System.Collections.Generic;
using AidDeskDatabase_DataAccess_EF.Entities;
using Microsoft.EntityFrameworkCore;

namespace AidDeskDatabase_DataAccess_EF;

public partial class AidDeskDbContext : DbContext
{
    public AidDeskDbContext()
    {
    }

    public AidDeskDbContext(DbContextOptions<AidDeskDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<TicketHistory> TicketHistories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            => optionsBuilder.UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection"));
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("AuditLog_pkey");

            entity.ToTable("AuditLog");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AuthorOfChangesId).HasColumnName("authorOfChangesId");
            entity.Property(e => e.CreatedAt).HasColumnName("createdAt");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Operation)
                .HasMaxLength(50)
                .HasColumnName("operation");
            entity.Property(e => e.TicketId).HasColumnName("ticketId");

            entity.HasOne(d => d.AuthorOfChanges).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.AuthorOfChangesId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_auditLog.authorOfChangesId_user.Id");

            entity.HasOne(d => d.Ticket).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.TicketId)
                .HasConstraintName("fk_auditLog.ticketId_ticket.Id");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Comment_pkey");

            entity.ToTable("Comment");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AuthorId).HasColumnName("authorId");
            entity.Property(e => e.CreatedAt).HasColumnName("createdAt");
            entity.Property(e => e.Text).HasColumnName("text");
            entity.Property(e => e.TicketId).HasColumnName("ticketId");
            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .HasColumnName("type");

            entity.HasOne(d => d.Author).WithMany(p => p.Comments)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_comment.authorId_user.Id");

            entity.HasOne(d => d.Ticket).WithMany(p => p.Comments)
                .HasForeignKey(d => d.TicketId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_comment.ticketId_ticket.Id");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Ticket_pkey");

            entity.ToTable("Ticket");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.AssignedToId).HasColumnName("assignedToId");
            entity.Property(e => e.CreatedAt).HasColumnName("createdAt");
            entity.Property(e => e.CreatedById).HasColumnName("createdById");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Priority)
                .HasMaxLength(20)
                .HasColumnName("priority");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(150)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt).HasColumnName("updatedAt");

            entity.HasOne(d => d.AssignedTo).WithMany(p => p.TicketAssignedTos)
                .HasForeignKey(d => d.AssignedToId)
                .HasConstraintName("fk_ticket.assignedToId_user.Id");

            entity.HasOne(d => d.CreatedBy).WithMany(p => p.TicketCreatedBies)
                .HasForeignKey(d => d.CreatedById)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_ticket.createdById_user.Id");
        });

        modelBuilder.Entity<TicketHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TicketHistory_pkey");

            entity.ToTable("TicketHistory");

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.ChangedAt).HasColumnName("changedAt");
            entity.Property(e => e.ChangedById).HasColumnName("changedById");
            entity.Property(e => e.NewStatus)
                .HasMaxLength(30)
                .HasColumnName("newStatus");
            entity.Property(e => e.OldStatus)
                .HasMaxLength(30)
                .HasColumnName("oldStatus");
            entity.Property(e => e.TicketId).HasColumnName("ticketId");

            entity.HasOne(d => d.ChangedBy).WithMany(p => p.TicketHistories)
                .HasForeignKey(d => d.ChangedById)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_ticketHistory.changedById_user.Id");

            entity.HasOne(d => d.Ticket).WithMany(p => p.TicketHistories)
                .HasForeignKey(d => d.TicketId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_ticketHistory.ticketId_ticket.Id");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("User_pkey");

            entity.ToTable("User");

            entity.HasIndex(e => e.Email, "email").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(e => e.CreatedAt).HasColumnName("createdAt");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(50)
                .HasColumnName("firstName");
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .HasColumnName("lastName");
            entity.Property(e => e.PasswordHash).HasColumnName("passwordHash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnName("phoneNumber");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
