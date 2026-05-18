import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class PostCard extends StatefulWidget {
  final Map<String, dynamic> post;
  final void Function(String)? onDelete;

  const PostCard({
    super.key,
    required this.post,
    this.onDelete,
  });

  @override
  State<PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  bool _liked = false;
  late int _likesCount;
  bool _likeLoading = false;

  @override
  void initState() {
    super.initState();
    _likesCount = widget.post['likes_count'] ?? 0;
  }

  Future<void> _handleLike() async {
    if (_likeLoading) return;
    setState(() => _likeLoading = true);
    try {
      if (_liked) {
        await ApiService.unlikePost(widget.post['id']);
        setState(() { _likesCount--; _liked = false; });
      } else {
        await ApiService.likePost(widget.post['id']);
        setState(() { _likesCount++; _liked = true; });
      }
    } catch (e) {
      debugPrint('Like error: $e');
    } finally {
      setState(() => _likeLoading = false);
    }
  }

  Future<void> _handleDelete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF18181B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text(
          'Delete Post',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        content: const Text(
          'Are you sure you want to delete this post?',
          style: TextStyle(color: Color(0xFF71717A)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel',
              style: TextStyle(color: Color(0xFF71717A))),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete',
              style: TextStyle(
                color: Color(0xFFF87171),
                fontWeight: FontWeight.w700,
              )),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await ApiService.deletePost(widget.post['id']);
        if (widget.onDelete != null) {
          widget.onDelete!(widget.post['id']);
        }
      } catch (e) {
        debugPrint('Delete error: $e');
      }
    }
  }

  String _timeAgo(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.tryParse(dateStr);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    return '${diff.inDays}d';
  }

  @override
  Widget build(BuildContext context) {
    final post = widget.post;
    final user = post['users'] as Map<String, dynamic>?;
    final currentUser = context.read<AuthProvider>();
    final isOwner = currentUser.userId == post['user_id'];

    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context, '/post',
        arguments: post['id'],
      ),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF18181B),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF27272A)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // ─── Header ───────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(
                children: [
                  // Avatar
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(
                      context, '/profile',
                      arguments: user?['username'],
                    ),
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: const Color(0xFF2563EB),
                      backgroundImage: user?['profile_picture'] != null
                          ? NetworkImage(user!['profile_picture'])
                          : null,
                      child: user?['profile_picture'] == null
                          ? Text(
                              (user?['name'] ?? 'U')[0].toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            )
                          : null,
                    ),
                  ),

                  const SizedBox(width: 12),

                  // Name + username + time
                  Expanded(
                    child: GestureDetector(
                      onTap: () => Navigator.pushNamed(
                        context, '/profile',
                        arguments: user?['username'],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?['name'] ?? 'Unknown',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            '@${user?['username'] ?? ''} · ${_timeAgo(post['created_at'])}',
                            style: const TextStyle(
                              color: Color(0xFF52525B),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Post type badge
                  if (post['post_type'] != 'text') ...[
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(
                          color: const Color(0xFF2563EB).withOpacity(0.2),
                        ),
                      ),
                      child: Text(
                        post['post_type'].toString().toUpperCase(),
                        style: const TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],

                  // Delete button
                  if (isOwner)
                    GestureDetector(
                      onTap: _handleDelete,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.delete_outline,
                          color: Color(0xFF3F3F46),
                          size: 18,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // ─── Content ──────────────────────────────
            if (post['content'] != null &&
                post['content'].toString().isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Text(
                  post['content'],
                  style: const TextStyle(
                    color: Color(0xFFE4E4E7),
                    fontSize: 15,
                    height: 1.6,
                  ),
                ),
              ),

            // ─── Image ────────────────────────────────
            if (post['image_url'] != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 12, 0, 0),
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(0),
                    bottomRight: Radius.circular(0),
                  ),
                  child: Image.network(
                    post['image_url'],
                    width: double.infinity,
                    height: 260,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 200,
                      color: const Color(0xFF27272A),
                      child: const Center(
                        child: Icon(Icons.broken_image,
                          color: Color(0xFF52525B), size: 40),
                      ),
                    ),
                    loadingBuilder: (context, child, progress) {
                      if (progress == null) return child;
                      return Container(
                        height: 200,
                        color: const Color(0xFF27272A),
                        child: const Center(
                          child: CircularProgressIndicator(
                            color: Color(0xFF2563EB), strokeWidth: 2),
                        ),
                      );
                    },
                  ),
                ),
              ),

            // ─── Actions ──────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 16, 8),
              child: Row(
                children: [

                  // Like button
                  _ActionButton(
                    icon: _liked
                        ? Icons.favorite
                        : Icons.favorite_border,
                    label: '$_likesCount',
                    color: _liked
                        ? const Color(0xFFF87171)
                        : const Color(0xFF71717A),
                    onTap: _handleLike,
                    loading: _likeLoading,
                  ),

                  const SizedBox(width: 4),

                  // Comment button
                  _ActionButton(
                    icon: Icons.chat_bubble_outline,
                    label: '${post['comments_count'] ?? 0}',
                    color: const Color(0xFF71717A),
                    onTap: () => Navigator.pushNamed(
                      context, '/post',
                      arguments: post['id'],
                    ),
                  ),

                  const Spacer(),

                  // Engagement score
                  Row(
                    children: [
                      const Text('🔥',
                        style: TextStyle(fontSize: 12)),
                      const SizedBox(width: 4),
                      Text(
                        '${post['engagement_score'] ?? 0}',
                        style: const TextStyle(
                          color: Color(0xFF3F3F46),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

          ],
        ),
      ),
    );
  }
}

// ─── Reusable action button ───────────────────────────
class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final bool loading;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(100),
        ),
        child: Row(
          children: [
            if (loading)
              const SizedBox(
                width: 16, height: 16,
                child: CircularProgressIndicator(
                  color: Color(0xFF71717A), strokeWidth: 1.5),
              )
            else
              Icon(icon, color: color, size: 18),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}